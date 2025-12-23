import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import {
  createBookingValidation,
  updateBookingValidation,
  createJobCardValidation,
  updateJobCardValidation,
  createWarrantyClaimValidation,
  updateWarrantyClaimValidation,
  createLeadValidation,
  createTestRideValidation,
  createSpareValidation,
  createDealerValidation,
  BookingWorkflow,
  JobCardWorkflow,
  WarrantyWorkflow,
  InventoryService,
  normalizePhone,
  generateBookingNumber,
  generateJobNumber,
  generateClaimNumber,
  generateComplaintNumber,
  generateLeadNumber,
} from "./services/business-logic";
import {
  formatCurrencyINR,
  formatDateLocal,
  calculateGST,
  BookingStatus,
  JobCardStatus,
  WarrantyClaimStatus,
  type BookingStatusType,
  type JobCardStatusType,
  type WarrantyClaimStatusType,
} from "@shared/utils/international";
import { UserRole, hasModuleAccess, hasPermission, Module, Permission, type UserRoleType } from "@shared/schema";

interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

interface FilterParams {
  status?: string;
  dealerId?: string;
  fromDate?: string;
  toDate?: string;
  search?: string;
}

function getPaginationParams(req: Request): PaginationParams {
  return {
    page: Math.max(1, parseInt(req.query.page as string) || 1),
    limit: Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20)),
    sortBy: req.query.sortBy as string,
    sortOrder: (req.query.sortOrder as "asc" | "desc") || "desc",
  };
}

function getFilterParams(req: Request): FilterParams {
  return {
    status: req.query.status as string,
    dealerId: req.query.dealerId as string,
    fromDate: req.query.fromDate as string,
    toDate: req.query.toDate as string,
    search: req.query.search as string,
  };
}

function paginateArray<T>(array: T[], params: PaginationParams): { data: T[]; total: number; page: number; totalPages: number } {
  const start = (params.page - 1) * params.limit;
  const paginatedData = array.slice(start, start + params.limit);
  return {
    data: paginatedData,
    total: array.length,
    page: params.page,
    totalPages: Math.ceil(array.length / params.limit),
  };
}

function handleValidationError(error: unknown, res: Response): boolean {
  if (error instanceof z.ZodError) {
    const formattedErrors = error.errors.map(e => ({
      field: e.path.join("."),
      message: e.message,
    }));
    res.status(400).json(createErrorResponse(
      "Validation failed",
      "VALIDATION_ERROR",
      formattedErrors
    ));
    return true;
  }
  return false;
}

function createApiResponse<T>(data: T, message?: string) {
  return {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString(),
  };
}

function createErrorResponse(error: string, code: string, details?: unknown) {
  return {
    success: false,
    error,
    code,
    details,
    timestamp: new Date().toISOString(),
  };
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  await storage.seedData();

  app.get("/api/home/dashboard", async (req: Request, res: Response) => {
    try {
      const role = req.query.role as string || "dealer_principal";
      const dealerId = req.query.dealerId as string;
      
      const stats = await storage.getDashboardStats();
      const recentBookings = await storage.getRecentBookings(5);
      const activeJobCards = await storage.getActiveJobCards();
      
      const recentActivity = recentBookings.slice(0, 3).map(b => ({
        id: b.id,
        type: "booking",
        description: `Booking ${b.bookingNumber} - ${b.customerName}`,
        status: b.status,
        time: b.createdAt ? formatDateLocal(new Date(b.createdAt)) : "Recently",
      }));
      
      activeJobCards.slice(0, 2).forEach(jc => {
        recentActivity.push({
          id: jc.id,
          type: "service",
          description: `Job Card ${jc.jobNumber} - ${jc.serviceType}`,
          status: jc.status,
          time: jc.createdAt ? formatDateLocal(new Date(jc.createdAt)) : "Recently",
        });
      });

      res.json(createApiResponse({ stats, recentActivity, role }));
    } catch (error) {
      res.status(500).json(createErrorResponse("Failed to fetch dashboard data", "DASHBOARD_ERROR"));
    }
  });

  app.get("/api/dashboard/stats", async (_req: Request, res: Response) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(createApiResponse(stats));
    } catch (error) {
      res.status(500).json(createErrorResponse("Failed to fetch dashboard stats", "STATS_ERROR"));
    }
  });

  app.get("/api/dashboard/sales-trend", async (_req: Request, res: Response) => {
    try {
      const trend = await storage.getSalesTrend();
      res.json(createApiResponse(trend));
    } catch (error) {
      res.status(500).json(createErrorResponse("Failed to fetch sales trend", "TREND_ERROR"));
    }
  });

  app.get("/api/dashboard/service-metrics", async (_req: Request, res: Response) => {
    try {
      const metrics = await storage.getServiceMetrics();
      res.json(createApiResponse(metrics));
    } catch (error) {
      res.status(500).json(createErrorResponse("Failed to fetch service metrics", "METRICS_ERROR"));
    }
  });

  app.get("/api/bookings", async (req: Request, res: Response) => {
    try {
      const pagination = getPaginationParams(req);
      const filters = getFilterParams(req);
      
      let bookings = await storage.getBookings();
      
      if (filters.status) {
        bookings = bookings.filter(b => b.status === filters.status);
      }
      if (filters.dealerId) {
        bookings = bookings.filter(b => b.dealerId === filters.dealerId);
      }
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        bookings = bookings.filter(b => 
          b.customerName.toLowerCase().includes(searchLower) ||
          b.bookingNumber.toLowerCase().includes(searchLower) ||
          b.vehicleModel.toLowerCase().includes(searchLower)
        );
      }
      
      const result = paginateArray(bookings, pagination);
      
      const enrichedData = result.data.map(b => ({
        ...b,
        formattedAmount: formatCurrencyINR(b.bookingAmount),
        nextActions: BookingWorkflow.getNextStatuses(b.status as BookingStatusType),
        canAllocate: BookingWorkflow.canAllocate(b),
        canDeliver: BookingWorkflow.canDeliver(b),
      }));
      
      res.json(createApiResponse({
        ...result,
        data: enrichedData,
      }));
    } catch (error) {
      res.status(500).json(createErrorResponse("Failed to fetch bookings", "BOOKINGS_FETCH_ERROR"));
    }
  });

  app.get("/api/bookings/recent", async (req: Request, res: Response) => {
    try {
      const limit = Math.min(20, parseInt(req.query.limit as string) || 5);
      const bookings = await storage.getRecentBookings(limit);
      res.json(createApiResponse(bookings));
    } catch (error) {
      res.status(500).json(createErrorResponse("Failed to fetch recent bookings", "BOOKINGS_RECENT_ERROR"));
    }
  });

  app.get("/api/bookings/:id", async (req: Request, res: Response) => {
    try {
      const booking = await storage.getBooking(req.params.id);
      if (!booking) {
        return res.status(404).json(createErrorResponse("Booking not found", "NOT_FOUND"));
      }
      
      const enriched = {
        ...booking,
        formattedAmount: formatCurrencyINR(booking.bookingAmount),
        nextActions: BookingWorkflow.getNextStatuses(booking.status as BookingStatusType),
        canAllocate: BookingWorkflow.canAllocate(booking),
        canDeliver: BookingWorkflow.canDeliver(booking),
        taxBreakdown: calculateGST(booking.bookingAmount * 10),
      };
      
      res.json(createApiResponse(enriched));
    } catch (error) {
      res.status(500).json(createErrorResponse("Failed to fetch booking", "BOOKING_FETCH_ERROR"));
    }
  });

  app.post("/api/bookings", async (req: Request, res: Response) => {
    try {
      const validated = createBookingValidation.parse(req.body);
      
      const bookingData = {
        ...validated,
        customerPhone: normalizePhone(validated.customerPhone),
        status: validated.status || BookingStatus.PENDING,
      };
      
      const booking = await storage.createBooking(bookingData);
      res.status(201).json(createApiResponse(booking, "Booking created successfully"));
    } catch (error) {
      if (!handleValidationError(error, res)) {
        res.status(500).json(createErrorResponse("Failed to create booking", "BOOKING_CREATE_ERROR"));
      }
    }
  });

  app.patch("/api/bookings/:id", async (req: Request, res: Response) => {
    try {
      const existing = await storage.getBooking(req.params.id);
      if (!existing) {
        return res.status(404).json(createErrorResponse("Booking not found", "NOT_FOUND"));
      }
      
      const validated = updateBookingValidation.parse(req.body);
      
      if (validated.status && validated.status !== existing.status) {
        const isValidTransition = BookingWorkflow.validateTransition(
          existing.status as BookingStatusType,
          validated.status as BookingStatusType
        );
        if (!isValidTransition) {
          return res.status(400).json(createErrorResponse(
            `Cannot transition from ${existing.status} to ${validated.status}`,
            "INVALID_STATUS_TRANSITION"
          ));
        }
        
        if (validated.status === BookingStatus.ALLOCATED && !BookingWorkflow.canAllocate(existing)) {
          return res.status(400).json(createErrorResponse(
            "Cannot allocate: KYC must be approved first",
            "KYC_REQUIRED"
          ));
        }
        
        if (validated.status === BookingStatus.DELIVERED && !BookingWorkflow.canDeliver(existing)) {
          return res.status(400).json(createErrorResponse(
            "Cannot deliver: Vehicle must be allocated and VIN assigned",
            "VIN_REQUIRED"
          ));
        }
      }
      
      if (validated.customerPhone) {
        validated.customerPhone = normalizePhone(validated.customerPhone);
      }
      
      const booking = await storage.updateBooking(req.params.id, validated);
      res.json(createApiResponse(booking, "Booking updated successfully"));
    } catch (error) {
      if (!handleValidationError(error, res)) {
        res.status(500).json(createErrorResponse("Failed to update booking", "BOOKING_UPDATE_ERROR"));
      }
    }
  });

  app.post("/api/bookings/:id/allocate", async (req: Request, res: Response) => {
    try {
      const booking = await storage.getBooking(req.params.id);
      if (!booking) {
        return res.status(404).json(createErrorResponse("Booking not found", "NOT_FOUND"));
      }
      
      if (!BookingWorkflow.canAllocate(booking)) {
        return res.status(400).json(createErrorResponse(
          "Cannot allocate: Booking must be confirmed and KYC approved",
          "ALLOCATION_BLOCKED"
        ));
      }
      
      const { vin } = req.body;
      if (!vin) {
        return res.status(400).json(createErrorResponse("VIN is required for allocation", "VIN_REQUIRED"));
      }
      
      const updated = await storage.updateBooking(req.params.id, {
        status: BookingStatus.ALLOCATED,
        vin,
      });
      
      res.json(createApiResponse(updated, "Vehicle allocated successfully"));
    } catch (error) {
      res.status(500).json(createErrorResponse("Failed to allocate vehicle", "ALLOCATION_ERROR"));
    }
  });

  app.post("/api/bookings/:id/deliver", async (req: Request, res: Response) => {
    try {
      const booking = await storage.getBooking(req.params.id);
      if (!booking) {
        return res.status(404).json(createErrorResponse("Booking not found", "NOT_FOUND"));
      }
      
      if (!BookingWorkflow.canDeliver(booking)) {
        return res.status(400).json(createErrorResponse(
          "Cannot deliver: Booking must be ready for delivery with VIN assigned",
          "DELIVERY_BLOCKED"
        ));
      }
      
      const updated = await storage.updateBooking(req.params.id, {
        status: BookingStatus.DELIVERED,
      });
      
      res.json(createApiResponse(updated, "Vehicle delivered successfully"));
    } catch (error) {
      res.status(500).json(createErrorResponse("Failed to deliver vehicle", "DELIVERY_ERROR"));
    }
  });

  app.delete("/api/bookings/:id", async (req: Request, res: Response) => {
    try {
      const booking = await storage.getBooking(req.params.id);
      if (!booking) {
        return res.status(404).json(createErrorResponse("Booking not found", "NOT_FOUND"));
      }
      
      if (booking.status === BookingStatus.DELIVERED) {
        return res.status(400).json(createErrorResponse(
          "Cannot delete delivered bookings",
          "DELETE_BLOCKED"
        ));
      }
      
      const deleted = await storage.deleteBooking(req.params.id);
      if (!deleted) {
        return res.status(404).json(createErrorResponse("Booking not found", "NOT_FOUND"));
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json(createErrorResponse("Failed to delete booking", "BOOKING_DELETE_ERROR"));
    }
  });

  app.get("/api/job-cards", async (req: Request, res: Response) => {
    try {
      const pagination = getPaginationParams(req);
      const filters = getFilterParams(req);
      
      let jobCards = await storage.getJobCards();
      
      if (filters.status) {
        jobCards = jobCards.filter(jc => jc.status === filters.status);
      }
      if (filters.dealerId) {
        jobCards = jobCards.filter(jc => jc.dealerId === filters.dealerId);
      }
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        jobCards = jobCards.filter(jc => 
          jc.customerName.toLowerCase().includes(searchLower) ||
          jc.jobNumber.toLowerCase().includes(searchLower) ||
          jc.vehicleNumber.toLowerCase().includes(searchLower)
        );
      }
      
      const result = paginateArray(jobCards, pagination);
      
      const enrichedData = result.data.map(jc => ({
        ...jc,
        nextActions: JobCardWorkflow.getNextStatuses(jc.status as JobCardStatusType),
        canAssignTechnician: JobCardWorkflow.canAssignTechnician(jc),
        canComplete: JobCardWorkflow.canComplete(jc),
        totalCost: jc.laborCost && jc.partsCost 
          ? JobCardWorkflow.calculateTotalCost(jc.laborCost, jc.partsCost)
          : null,
      }));
      
      res.json(createApiResponse({
        ...result,
        data: enrichedData,
      }));
    } catch (error) {
      res.status(500).json(createErrorResponse("Failed to fetch job cards", "JOBCARDS_FETCH_ERROR"));
    }
  });

  app.get("/api/job-cards/active", async (req: Request, res: Response) => {
    try {
      const jobCards = await storage.getActiveJobCards();
      res.json(createApiResponse(jobCards));
    } catch (error) {
      res.status(500).json(createErrorResponse("Failed to fetch active job cards", "JOBCARDS_ACTIVE_ERROR"));
    }
  });

  app.get("/api/job-cards/:id", async (req: Request, res: Response) => {
    try {
      const jobCard = await storage.getJobCard(req.params.id);
      if (!jobCard) {
        return res.status(404).json(createErrorResponse("Job card not found", "NOT_FOUND"));
      }
      
      const enriched = {
        ...jobCard,
        nextActions: JobCardWorkflow.getNextStatuses(jobCard.status as JobCardStatusType),
        canAssignTechnician: JobCardWorkflow.canAssignTechnician(jobCard),
        canComplete: JobCardWorkflow.canComplete(jobCard),
        totalCost: jobCard.laborCost && jobCard.partsCost 
          ? JobCardWorkflow.calculateTotalCost(jobCard.laborCost, jobCard.partsCost)
          : null,
      };
      
      res.json(createApiResponse(enriched));
    } catch (error) {
      res.status(500).json(createErrorResponse("Failed to fetch job card", "JOBCARD_FETCH_ERROR"));
    }
  });

  app.post("/api/job-cards", async (req: Request, res: Response) => {
    try {
      const validated = createJobCardValidation.parse(req.body);
      
      const jobCardData = {
        ...validated,
        customerPhone: normalizePhone(validated.customerPhone),
        status: validated.status || JobCardStatus.OPEN,
      };
      
      const jobCard = await storage.createJobCard(jobCardData);
      res.status(201).json(createApiResponse(jobCard, "Job card created successfully"));
    } catch (error) {
      if (!handleValidationError(error, res)) {
        res.status(500).json(createErrorResponse("Failed to create job card", "JOBCARD_CREATE_ERROR"));
      }
    }
  });

  app.patch("/api/job-cards/:id", async (req: Request, res: Response) => {
    try {
      const existing = await storage.getJobCard(req.params.id);
      if (!existing) {
        return res.status(404).json(createErrorResponse("Job card not found", "NOT_FOUND"));
      }
      
      const validated = updateJobCardValidation.parse(req.body);
      
      if (validated.status && validated.status !== existing.status) {
        const isValidTransition = JobCardWorkflow.validateTransition(
          existing.status as JobCardStatusType,
          validated.status as JobCardStatusType
        );
        if (!isValidTransition) {
          return res.status(400).json(createErrorResponse(
            `Cannot transition from ${existing.status} to ${validated.status}`,
            "INVALID_STATUS_TRANSITION"
          ));
        }
        
        if (validated.status === JobCardStatus.COMPLETED && !JobCardWorkflow.canComplete(existing)) {
          return res.status(400).json(createErrorResponse(
            "Cannot complete: Technician must be assigned first",
            "TECHNICIAN_REQUIRED"
          ));
        }
      }
      
      if (validated.customerPhone) {
        validated.customerPhone = normalizePhone(validated.customerPhone);
      }
      
      const jobCard = await storage.updateJobCard(req.params.id, validated);
      res.json(createApiResponse(jobCard, "Job card updated successfully"));
    } catch (error) {
      if (!handleValidationError(error, res)) {
        res.status(500).json(createErrorResponse("Failed to update job card", "JOBCARD_UPDATE_ERROR"));
      }
    }
  });

  app.post("/api/job-cards/:id/assign-technician", async (req: Request, res: Response) => {
    try {
      const jobCard = await storage.getJobCard(req.params.id);
      if (!jobCard) {
        return res.status(404).json(createErrorResponse("Job card not found", "NOT_FOUND"));
      }
      
      if (!JobCardWorkflow.canAssignTechnician(jobCard)) {
        return res.status(400).json(createErrorResponse(
          "Cannot assign technician: Job card must be open or pending parts",
          "ASSIGNMENT_BLOCKED"
        ));
      }
      
      const { technicianId, technicianName } = req.body;
      if (!technicianId || !technicianName) {
        return res.status(400).json(createErrorResponse(
          "Technician ID and name are required",
          "TECHNICIAN_DATA_REQUIRED"
        ));
      }
      
      const updated = await storage.updateJobCard(req.params.id, {
        technicianId,
        technicianName,
        status: JobCardStatus.IN_PROGRESS,
      });
      
      res.json(createApiResponse(updated, "Technician assigned successfully"));
    } catch (error) {
      res.status(500).json(createErrorResponse("Failed to assign technician", "ASSIGNMENT_ERROR"));
    }
  });

  app.post("/api/job-cards/:id/complete", async (req: Request, res: Response) => {
    try {
      const jobCard = await storage.getJobCard(req.params.id);
      if (!jobCard) {
        return res.status(404).json(createErrorResponse("Job card not found", "NOT_FOUND"));
      }
      
      if (!JobCardWorkflow.canComplete(jobCard)) {
        return res.status(400).json(createErrorResponse(
          "Cannot complete: Job card must be in progress with technician assigned",
          "COMPLETION_BLOCKED"
        ));
      }
      
      const { laborCost, partsCost } = req.body;
      
      const updated = await storage.updateJobCard(req.params.id, {
        status: JobCardStatus.COMPLETED,
        laborCost: laborCost || 0,
        partsCost: partsCost || 0,
        completedAt: new Date().toISOString(),
      });
      
      res.json(createApiResponse(updated, "Job card completed successfully"));
    } catch (error) {
      res.status(500).json(createErrorResponse("Failed to complete job card", "COMPLETION_ERROR"));
    }
  });

  app.delete("/api/job-cards/:id", async (req: Request, res: Response) => {
    try {
      const jobCard = await storage.getJobCard(req.params.id);
      if (!jobCard) {
        return res.status(404).json(createErrorResponse("Job card not found", "NOT_FOUND"));
      }
      
      if (jobCard.status === JobCardStatus.INVOICED || jobCard.status === JobCardStatus.CLOSED) {
        return res.status(400).json(createErrorResponse(
          "Cannot delete invoiced or closed job cards",
          "DELETE_BLOCKED"
        ));
      }
      
      const deleted = await storage.deleteJobCard(req.params.id);
      if (!deleted) {
        return res.status(404).json(createErrorResponse("Job card not found", "NOT_FOUND"));
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json(createErrorResponse("Failed to delete job card", "JOBCARD_DELETE_ERROR"));
    }
  });

  app.get("/api/inventory", async (req: Request, res: Response) => {
    try {
      const pagination = getPaginationParams(req);
      const filters = getFilterParams(req);
      
      let inventory = await storage.getInventory();
      
      if (filters.status) {
        inventory = inventory.filter(i => i.status === filters.status);
      }
      if (filters.dealerId) {
        inventory = inventory.filter(i => i.dealerId === filters.dealerId);
      }
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        inventory = inventory.filter(i => 
          i.vin.toLowerCase().includes(searchLower) ||
          i.model.toLowerCase().includes(searchLower)
        );
      }
      
      const result = paginateArray(inventory, pagination);
      
      const enrichedData = result.data.map(i => ({
        ...i,
        canAllocate: InventoryService.canAllocate(i),
      }));
      
      res.json(createApiResponse({
        ...result,
        data: enrichedData,
      }));
    } catch (error) {
      res.status(500).json(createErrorResponse("Failed to fetch inventory", "INVENTORY_FETCH_ERROR"));
    }
  });

  app.get("/api/dealers", async (req: Request, res: Response) => {
    try {
      const pagination = getPaginationParams(req);
      const dealers = await storage.getDealers();
      const result = paginateArray(dealers, pagination);
      res.json(createApiResponse(result));
    } catch (error) {
      res.status(500).json(createErrorResponse("Failed to fetch dealers", "DEALERS_FETCH_ERROR"));
    }
  });

  app.get("/api/dealers/:id", async (req: Request, res: Response) => {
    try {
      const dealer = await storage.getDealer(req.params.id);
      if (!dealer) {
        return res.status(404).json(createErrorResponse("Dealer not found", "NOT_FOUND"));
      }
      res.json(createApiResponse(dealer));
    } catch (error) {
      res.status(500).json(createErrorResponse("Failed to fetch dealer", "DEALER_FETCH_ERROR"));
    }
  });

  app.post("/api/dealers", async (req: Request, res: Response) => {
    try {
      const validated = createDealerValidation.parse(req.body);
      
      if (validated.phone) {
        validated.phone = normalizePhone(validated.phone);
      }
      
      const dealer = await storage.createDealer(validated);
      res.status(201).json(createApiResponse(dealer, "Dealer created successfully"));
    } catch (error) {
      if (!handleValidationError(error, res)) {
        res.status(500).json(createErrorResponse("Failed to create dealer", "DEALER_CREATE_ERROR"));
      }
    }
  });

  app.get("/api/leads", async (req: Request, res: Response) => {
    try {
      const pagination = getPaginationParams(req);
      const filters = getFilterParams(req);
      
      let leads = await storage.getLeads();
      
      if (filters.status) {
        leads = leads.filter(l => l.status === filters.status);
      }
      if (filters.dealerId) {
        leads = leads.filter(l => l.dealerId === filters.dealerId);
      }
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        leads = leads.filter(l => 
          l.name.toLowerCase().includes(searchLower) ||
          l.phone.includes(filters.search!)
        );
      }
      
      const result = paginateArray(leads, pagination);
      res.json(createApiResponse(result));
    } catch (error) {
      res.status(500).json(createErrorResponse("Failed to fetch leads", "LEADS_FETCH_ERROR"));
    }
  });

  app.post("/api/leads", async (req: Request, res: Response) => {
    try {
      const validated = createLeadValidation.parse(req.body);
      
      const leadData = {
        ...validated,
        phone: normalizePhone(validated.phone),
      };
      
      const lead = await storage.createLead(leadData);
      res.status(201).json(createApiResponse(lead, "Lead created successfully"));
    } catch (error) {
      if (!handleValidationError(error, res)) {
        res.status(500).json(createErrorResponse("Failed to create lead", "LEAD_CREATE_ERROR"));
      }
    }
  });

  app.patch("/api/leads/:id", async (req: Request, res: Response) => {
    try {
      const lead = await storage.updateLead(req.params.id, req.body);
      if (!lead) {
        return res.status(404).json(createErrorResponse("Lead not found", "NOT_FOUND"));
      }
      res.json(createApiResponse(lead, "Lead updated successfully"));
    } catch (error) {
      res.status(500).json(createErrorResponse("Failed to update lead", "LEAD_UPDATE_ERROR"));
    }
  });

  app.get("/api/test-rides", async (req: Request, res: Response) => {
    try {
      const pagination = getPaginationParams(req);
      const testRides = await storage.getTestRides();
      const result = paginateArray(testRides, pagination);
      res.json(createApiResponse(result));
    } catch (error) {
      res.status(500).json(createErrorResponse("Failed to fetch test rides", "TESTRIDES_FETCH_ERROR"));
    }
  });

  app.post("/api/test-rides", async (req: Request, res: Response) => {
    try {
      const validated = createTestRideValidation.parse(req.body);
      
      const testRideData = {
        ...validated,
        customerPhone: normalizePhone(validated.customerPhone),
      };
      
      const testRide = await storage.createTestRide(testRideData);
      res.status(201).json(createApiResponse(testRide, "Test ride scheduled successfully"));
    } catch (error) {
      if (!handleValidationError(error, res)) {
        res.status(500).json(createErrorResponse("Failed to create test ride", "TESTRIDE_CREATE_ERROR"));
      }
    }
  });

  app.patch("/api/test-rides/:id", async (req: Request, res: Response) => {
    try {
      const testRide = await storage.updateTestRide(req.params.id, req.body);
      if (!testRide) {
        return res.status(404).json(createErrorResponse("Test ride not found", "NOT_FOUND"));
      }
      res.json(createApiResponse(testRide, "Test ride updated successfully"));
    } catch (error) {
      res.status(500).json(createErrorResponse("Failed to update test ride", "TESTRIDE_UPDATE_ERROR"));
    }
  });

  app.get("/api/complaints", async (req: Request, res: Response) => {
    try {
      const pagination = getPaginationParams(req);
      const filters = getFilterParams(req);
      
      let complaints = await storage.getComplaints();
      
      if (filters.status) {
        complaints = complaints.filter(c => c.status === filters.status);
      }
      if (filters.dealerId) {
        complaints = complaints.filter(c => c.dealerId === filters.dealerId);
      }
      
      const result = paginateArray(complaints, pagination);
      res.json(createApiResponse(result));
    } catch (error) {
      res.status(500).json(createErrorResponse("Failed to fetch complaints", "COMPLAINTS_FETCH_ERROR"));
    }
  });

  app.post("/api/complaints", async (req: Request, res: Response) => {
    try {
      const complaint = await storage.createComplaint(req.body);
      res.status(201).json(createApiResponse(complaint, "Complaint registered successfully"));
    } catch (error) {
      res.status(500).json(createErrorResponse("Failed to create complaint", "COMPLAINT_CREATE_ERROR"));
    }
  });

  app.patch("/api/complaints/:id", async (req: Request, res: Response) => {
    try {
      const complaint = await storage.updateComplaint(req.params.id, req.body);
      if (!complaint) {
        return res.status(404).json(createErrorResponse("Complaint not found", "NOT_FOUND"));
      }
      res.json(createApiResponse(complaint, "Complaint updated successfully"));
    } catch (error) {
      res.status(500).json(createErrorResponse("Failed to update complaint", "COMPLAINT_UPDATE_ERROR"));
    }
  });

  app.get("/api/spares", async (req: Request, res: Response) => {
    try {
      const pagination = getPaginationParams(req);
      const filters = getFilterParams(req);
      
      let spares = await storage.getSpares();
      
      if (filters.dealerId) {
        spares = spares.filter(s => s.dealerId === filters.dealerId);
      }
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        spares = spares.filter(s => 
          s.partName.toLowerCase().includes(searchLower) ||
          s.partNumber.toLowerCase().includes(searchLower)
        );
      }
      
      const result = paginateArray(spares, pagination);
      
      const enrichedData = result.data.map(s => ({
        ...s,
        isLowStock: InventoryService.isLowStock(s),
        reorderQuantity: InventoryService.calculateReorderQuantity(s),
        formattedPrice: formatCurrencyINR(s.unitPrice),
      }));
      
      res.json(createApiResponse({
        ...result,
        data: enrichedData,
      }));
    } catch (error) {
      res.status(500).json(createErrorResponse("Failed to fetch spare parts", "SPARES_FETCH_ERROR"));
    }
  });

  app.post("/api/spares", async (req: Request, res: Response) => {
    try {
      const validated = createSpareValidation.parse(req.body);
      const spare = await storage.createSpare(validated);
      res.status(201).json(createApiResponse(spare, "Spare part created successfully"));
    } catch (error) {
      if (!handleValidationError(error, res)) {
        res.status(500).json(createErrorResponse("Failed to create spare part", "SPARE_CREATE_ERROR"));
      }
    }
  });

  app.patch("/api/spares/:id", async (req: Request, res: Response) => {
    try {
      const spare = await storage.updateSpare(req.params.id, req.body);
      if (!spare) {
        return res.status(404).json(createErrorResponse("Spare part not found", "NOT_FOUND"));
      }
      res.json(createApiResponse(spare, "Spare part updated successfully"));
    } catch (error) {
      res.status(500).json(createErrorResponse("Failed to update spare part", "SPARE_UPDATE_ERROR"));
    }
  });

  app.get("/api/warranty-claims", async (req: Request, res: Response) => {
    try {
      const pagination = getPaginationParams(req);
      const filters = getFilterParams(req);
      
      let claims = await storage.getWarrantyClaims();
      
      if (filters.status) {
        claims = claims.filter(c => c.status === filters.status);
      }
      if (filters.dealerId) {
        claims = claims.filter(c => c.dealerId === filters.dealerId);
      }
      
      const result = paginateArray(claims, pagination);
      
      const enrichedData = result.data.map(c => ({
        ...c,
        nextActions: WarrantyWorkflow.getNextStatuses(c.status as WarrantyClaimStatusType),
        canApprove: WarrantyWorkflow.canApprove(c),
        canReimburse: WarrantyWorkflow.canReimburse(c),
        formattedClaimAmount: c.claimAmount ? formatCurrencyINR(c.claimAmount) : null,
        formattedApprovedAmount: c.approvedAmount ? formatCurrencyINR(c.approvedAmount) : null,
      }));
      
      res.json(createApiResponse({
        ...result,
        data: enrichedData,
      }));
    } catch (error) {
      res.status(500).json(createErrorResponse("Failed to fetch warranty claims", "WARRANTY_FETCH_ERROR"));
    }
  });

  app.get("/api/warranty-claims/:id", async (req: Request, res: Response) => {
    try {
      const claim = await storage.getWarrantyClaim(req.params.id);
      if (!claim) {
        return res.status(404).json(createErrorResponse("Warranty claim not found", "NOT_FOUND"));
      }
      
      const enriched = {
        ...claim,
        nextActions: WarrantyWorkflow.getNextStatuses(claim.status as WarrantyClaimStatusType),
        canApprove: WarrantyWorkflow.canApprove(claim),
        canReimburse: WarrantyWorkflow.canReimburse(claim),
      };
      
      res.json(createApiResponse(enriched));
    } catch (error) {
      res.status(500).json(createErrorResponse("Failed to fetch warranty claim", "WARRANTY_FETCH_ERROR"));
    }
  });

  app.post("/api/warranty-claims", async (req: Request, res: Response) => {
    try {
      const validated = createWarrantyClaimValidation.parse(req.body);
      const claim = await storage.createWarrantyClaim(validated);
      res.status(201).json(createApiResponse(claim, "Warranty claim created successfully"));
    } catch (error) {
      if (!handleValidationError(error, res)) {
        res.status(500).json(createErrorResponse("Failed to create warranty claim", "WARRANTY_CREATE_ERROR"));
      }
    }
  });

  app.patch("/api/warranty-claims/:id", async (req: Request, res: Response) => {
    try {
      const existing = await storage.getWarrantyClaim(req.params.id);
      if (!existing) {
        return res.status(404).json(createErrorResponse("Warranty claim not found", "NOT_FOUND"));
      }
      
      const validated = updateWarrantyClaimValidation.parse(req.body);
      
      if (validated.status && validated.status !== existing.status) {
        const isValidTransition = WarrantyWorkflow.validateTransition(
          existing.status as WarrantyClaimStatusType,
          validated.status as WarrantyClaimStatusType
        );
        if (!isValidTransition) {
          return res.status(400).json(createErrorResponse(
            `Cannot transition from ${existing.status} to ${validated.status}`,
            "INVALID_STATUS_TRANSITION"
          ));
        }
      }
      
      const claim = await storage.updateWarrantyClaim(req.params.id, validated);
      res.json(createApiResponse(claim, "Warranty claim updated successfully"));
    } catch (error) {
      if (!handleValidationError(error, res)) {
        res.status(500).json(createErrorResponse("Failed to update warranty claim", "WARRANTY_UPDATE_ERROR"));
      }
    }
  });

  app.post("/api/warranty-claims/:id/approve", async (req: Request, res: Response) => {
    try {
      const claim = await storage.getWarrantyClaim(req.params.id);
      if (!claim) {
        return res.status(404).json(createErrorResponse("Warranty claim not found", "NOT_FOUND"));
      }
      
      if (!WarrantyWorkflow.canApprove(claim)) {
        return res.status(400).json(createErrorResponse(
          "Cannot approve: Claim must be under review",
          "APPROVAL_BLOCKED"
        ));
      }
      
      const { approvedAmount, isPartial } = req.body;
      if (approvedAmount === undefined || approvedAmount <= 0) {
        return res.status(400).json(createErrorResponse(
          "Approved amount is required and must be positive",
          "AMOUNT_REQUIRED"
        ));
      }
      
      const status = isPartial ? WarrantyClaimStatus.PARTIALLY_APPROVED : WarrantyClaimStatus.APPROVED;
      
      const updated = await storage.updateWarrantyClaim(req.params.id, {
        status,
        approvedAmount,
        approvedAt: new Date().toISOString(),
      });
      
      res.json(createApiResponse(updated, "Warranty claim approved successfully"));
    } catch (error) {
      res.status(500).json(createErrorResponse("Failed to approve warranty claim", "APPROVAL_ERROR"));
    }
  });

  app.post("/api/warranty-claims/:id/reject", async (req: Request, res: Response) => {
    try {
      const claim = await storage.getWarrantyClaim(req.params.id);
      if (!claim) {
        return res.status(404).json(createErrorResponse("Warranty claim not found", "NOT_FOUND"));
      }
      
      if (claim.status !== WarrantyClaimStatus.UNDER_REVIEW) {
        return res.status(400).json(createErrorResponse(
          "Cannot reject: Claim must be under review",
          "REJECTION_BLOCKED"
        ));
      }
      
      const { rejectionReason } = req.body;
      if (!rejectionReason) {
        return res.status(400).json(createErrorResponse(
          "Rejection reason is required",
          "REASON_REQUIRED"
        ));
      }
      
      const updated = await storage.updateWarrantyClaim(req.params.id, {
        status: WarrantyClaimStatus.REJECTED,
        rejectionReason,
        rejectedAt: new Date().toISOString(),
      });
      
      res.json(createApiResponse(updated, "Warranty claim rejected"));
    } catch (error) {
      res.status(500).json(createErrorResponse("Failed to reject warranty claim", "REJECTION_ERROR"));
    }
  });

  app.get("/api/battery-health", async (req: Request, res: Response) => {
    try {
      const pagination = getPaginationParams(req);
      const records = await storage.getBatteryHealthRecords();
      const result = paginateArray(records, pagination);
      res.json(createApiResponse(result));
    } catch (error) {
      res.status(500).json(createErrorResponse("Failed to fetch battery health records", "BATTERY_FETCH_ERROR"));
    }
  });

  app.post("/api/battery-health", async (req: Request, res: Response) => {
    try {
      const record = await storage.createBatteryHealth(req.body);
      res.status(201).json(createApiResponse(record, "Battery health record created successfully"));
    } catch (error) {
      res.status(500).json(createErrorResponse("Failed to create battery health record", "BATTERY_CREATE_ERROR"));
    }
  });

  const demoUsers = [
    { id: "1", employeeId: "EMP-001", name: "Admin User", email: "admin@zforce.in", phone: "+91 9876543210", role: UserRole.HO_SUPER_ADMIN, status: "active" },
    { id: "2", employeeId: "EMP-002", name: "Dealer Manager", email: "dealer@zforce.in", phone: "+91 9876543211", role: UserRole.DEALER_PRINCIPAL, dealerId: "dealer-1", status: "active" },
    { id: "3", employeeId: "EMP-003", name: "Service Tech", email: "tech@zforce.in", phone: "+91 9876543212", role: UserRole.TECHNICIAN, dealerId: "dealer-1", status: "active" },
    { id: "4", employeeId: "EMP-004", name: "Sales Exec", email: "sales@zforce.in", phone: "+91 9876543213", role: UserRole.DEALER_SALES_EXECUTIVE, dealerId: "dealer-1", status: "active" },
    { id: "5", employeeId: "EMP-005", name: "Finance Head", email: "finance@zforce.in", phone: "+91 9876543214", role: UserRole.HO_FINANCE_ADMIN, status: "active" },
  ];

  app.get("/api/users", async (req: Request, res: Response) => {
    try {
      const pagination = getPaginationParams(req);
      const result = paginateArray(demoUsers, pagination);
      res.json(createApiResponse(result));
    } catch (error) {
      res.status(500).json(createErrorResponse("Failed to fetch users", "USERS_FETCH_ERROR"));
    }
  });

  app.post("/api/users", async (req: Request, res: Response) => {
    try {
      const newUser = {
        id: String(demoUsers.length + 1),
        ...req.body,
        status: req.body.status || "active",
      };
      demoUsers.push(newUser);
      res.status(201).json(createApiResponse(newUser, "User created successfully"));
    } catch (error) {
      res.status(500).json(createErrorResponse("Failed to create user", "USER_CREATE_ERROR"));
    }
  });

  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { username, password, role } = req.body;
      
      if (!username || !password) {
        return res.status(400).json(createErrorResponse("Username and password are required", "MISSING_CREDENTIALS"));
      }
      
      const validRoles = Object.values(UserRole);
      const userRole = role && validRoles.includes(role) ? role : UserRole.DEALER_PRINCIPAL;
      
      const user = {
        id: `user-${Date.now()}`,
        username,
        name: username.charAt(0).toUpperCase() + username.slice(1),
        role: userRole,
        email: `${username}@zforce.in`,
      };
      
      res.json(createApiResponse({ user }, "Login successful"));
    } catch (error) {
      res.status(500).json(createErrorResponse("Login failed", "LOGIN_ERROR"));
    }
  });

  app.post("/api/auth/logout", async (_req: Request, res: Response) => {
    res.json(createApiResponse(null, "Logout successful"));
  });

  app.get("/api/config/roles", async (_req: Request, res: Response) => {
    try {
      const roles = Object.entries(UserRole).map(([key, value]) => ({
        key,
        value,
        label: key.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, c => c.toUpperCase()),
      }));
      res.json(createApiResponse(roles));
    } catch (error) {
      res.status(500).json(createErrorResponse("Failed to fetch roles", "ROLES_FETCH_ERROR"));
    }
  });

  app.get("/api/config/modules", async (_req: Request, res: Response) => {
    try {
      const modules = Object.entries(Module).map(([key, value]) => ({
        key,
        value,
        label: key.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, c => c.toUpperCase()),
      }));
      res.json(createApiResponse(modules));
    } catch (error) {
      res.status(500).json(createErrorResponse("Failed to fetch modules", "MODULES_FETCH_ERROR"));
    }
  });

  return httpServer;
}
