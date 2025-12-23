import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertBookingSchema, insertJobCardSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  await storage.seedData();
  
  app.get("/api/dashboard/stats", async (_req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch dashboard stats" });
    }
  });

  app.get("/api/dashboard/sales-trend", async (_req, res) => {
    try {
      const trend = await storage.getSalesTrend();
      res.json(trend);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch sales trend" });
    }
  });

  app.get("/api/dashboard/service-metrics", async (_req, res) => {
    try {
      const metrics = await storage.getServiceMetrics();
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch service metrics" });
    }
  });

  app.get("/api/bookings", async (_req, res) => {
    try {
      const bookings = await storage.getBookings();
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch bookings" });
    }
  });

  app.get("/api/bookings/recent", async (_req, res) => {
    try {
      const bookings = await storage.getRecentBookings(5);
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch recent bookings" });
    }
  });

  app.get("/api/bookings/:id", async (req, res) => {
    try {
      const booking = await storage.getBooking(req.params.id);
      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }
      res.json(booking);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch booking" });
    }
  });

  app.post("/api/bookings", async (req, res) => {
    try {
      const validatedData = insertBookingSchema.parse(req.body);
      const booking = await storage.createBooking(validatedData);
      res.status(201).json(booking);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid booking data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create booking" });
    }
  });

  app.patch("/api/bookings/:id", async (req, res) => {
    try {
      const allowedFields = [
        "customerName", "customerPhone", "customerEmail", 
        "vehicleModel", "variant", "color", "bookingAmount",
        "status", "expectedDelivery", "vin", "kycStatus"
      ];
      const updates: Record<string, unknown> = {};
      for (const key of allowedFields) {
        if (key in req.body) {
          updates[key] = req.body[key];
        }
      }
      const booking = await storage.updateBooking(req.params.id, updates);
      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }
      res.json(booking);
    } catch (error) {
      res.status(500).json({ error: "Failed to update booking" });
    }
  });

  app.delete("/api/bookings/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteBooking(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Booking not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete booking" });
    }
  });

  app.get("/api/job-cards", async (_req, res) => {
    try {
      const jobCards = await storage.getJobCards();
      res.json(jobCards);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch job cards" });
    }
  });

  app.get("/api/job-cards/active", async (_req, res) => {
    try {
      const jobCards = await storage.getActiveJobCards();
      res.json(jobCards);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch active job cards" });
    }
  });

  app.get("/api/job-cards/:id", async (req, res) => {
    try {
      const jobCard = await storage.getJobCard(req.params.id);
      if (!jobCard) {
        return res.status(404).json({ error: "Job card not found" });
      }
      res.json(jobCard);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch job card" });
    }
  });

  app.post("/api/job-cards", async (req, res) => {
    try {
      const validatedData = insertJobCardSchema.parse(req.body);
      const jobCard = await storage.createJobCard(validatedData);
      res.status(201).json(jobCard);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid job card data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create job card" });
    }
  });

  app.patch("/api/job-cards/:id", async (req, res) => {
    try {
      const allowedFields = [
        "vehicleNumber", "vin", "customerName", "customerPhone",
        "serviceType", "complaints", "status", "technicianId",
        "technicianName", "estimatedCompletion", "completedAt",
        "laborCost", "partsCost", "priority"
      ];
      const updates: Record<string, unknown> = {};
      for (const key of allowedFields) {
        if (key in req.body) {
          updates[key] = req.body[key];
        }
      }
      const jobCard = await storage.updateJobCard(req.params.id, updates);
      if (!jobCard) {
        return res.status(404).json({ error: "Job card not found" });
      }
      res.json(jobCard);
    } catch (error) {
      res.status(500).json({ error: "Failed to update job card" });
    }
  });

  app.delete("/api/job-cards/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteJobCard(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Job card not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete job card" });
    }
  });

  app.get("/api/inventory", async (_req, res) => {
    try {
      const inventory = await storage.getInventory();
      res.json(inventory);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch inventory" });
    }
  });

  app.get("/api/dealers", async (_req, res) => {
    try {
      const dealers = await storage.getDealers();
      res.json(dealers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch dealers" });
    }
  });

  app.get("/api/dealers/:id", async (req, res) => {
    try {
      const dealer = await storage.getDealer(req.params.id);
      if (!dealer) {
        return res.status(404).json({ error: "Dealer not found" });
      }
      res.json(dealer);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch dealer" });
    }
  });

  app.post("/api/dealers", async (req, res) => {
    try {
      const dealer = await storage.createDealer(req.body);
      res.status(201).json(dealer);
    } catch (error) {
      res.status(500).json({ error: "Failed to create dealer" });
    }
  });

  app.get("/api/leads", async (_req, res) => {
    try {
      const leads = await storage.getLeads();
      res.json(leads);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch leads" });
    }
  });

  app.post("/api/leads", async (req, res) => {
    try {
      const lead = await storage.createLead(req.body);
      res.status(201).json(lead);
    } catch (error) {
      res.status(500).json({ error: "Failed to create lead" });
    }
  });

  app.patch("/api/leads/:id", async (req, res) => {
    try {
      const lead = await storage.updateLead(req.params.id, req.body);
      if (!lead) {
        return res.status(404).json({ error: "Lead not found" });
      }
      res.json(lead);
    } catch (error) {
      res.status(500).json({ error: "Failed to update lead" });
    }
  });

  app.get("/api/test-rides", async (_req, res) => {
    try {
      const testRides = await storage.getTestRides();
      res.json(testRides);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch test rides" });
    }
  });

  app.post("/api/test-rides", async (req, res) => {
    try {
      const testRide = await storage.createTestRide(req.body);
      res.status(201).json(testRide);
    } catch (error) {
      res.status(500).json({ error: "Failed to create test ride" });
    }
  });

  app.patch("/api/test-rides/:id", async (req, res) => {
    try {
      const testRide = await storage.updateTestRide(req.params.id, req.body);
      if (!testRide) {
        return res.status(404).json({ error: "Test ride not found" });
      }
      res.json(testRide);
    } catch (error) {
      res.status(500).json({ error: "Failed to update test ride" });
    }
  });

  app.get("/api/complaints", async (_req, res) => {
    try {
      const complaints = await storage.getComplaints();
      res.json(complaints);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch complaints" });
    }
  });

  app.post("/api/complaints", async (req, res) => {
    try {
      const complaint = await storage.createComplaint(req.body);
      res.status(201).json(complaint);
    } catch (error) {
      res.status(500).json({ error: "Failed to create complaint" });
    }
  });

  app.patch("/api/complaints/:id", async (req, res) => {
    try {
      const complaint = await storage.updateComplaint(req.params.id, req.body);
      if (!complaint) {
        return res.status(404).json({ error: "Complaint not found" });
      }
      res.json(complaint);
    } catch (error) {
      res.status(500).json({ error: "Failed to update complaint" });
    }
  });

  app.get("/api/spares", async (_req, res) => {
    try {
      const spares = await storage.getSpares();
      res.json(spares);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch spare parts" });
    }
  });

  app.post("/api/spares", async (req, res) => {
    try {
      const spare = await storage.createSpare(req.body);
      res.status(201).json(spare);
    } catch (error) {
      res.status(500).json({ error: "Failed to create spare part" });
    }
  });

  app.patch("/api/spares/:id", async (req, res) => {
    try {
      const spare = await storage.updateSpare(req.params.id, req.body);
      if (!spare) {
        return res.status(404).json({ error: "Spare part not found" });
      }
      res.json(spare);
    } catch (error) {
      res.status(500).json({ error: "Failed to update spare part" });
    }
  });

  app.get("/api/warranty-claims", async (_req, res) => {
    try {
      const claims = await storage.getWarrantyClaims();
      res.json(claims);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch warranty claims" });
    }
  });

  app.post("/api/warranty-claims", async (req, res) => {
    try {
      const claim = await storage.createWarrantyClaim(req.body);
      res.status(201).json(claim);
    } catch (error) {
      res.status(500).json({ error: "Failed to create warranty claim" });
    }
  });

  app.patch("/api/warranty-claims/:id", async (req, res) => {
    try {
      const claim = await storage.updateWarrantyClaim(req.params.id, req.body);
      if (!claim) {
        return res.status(404).json({ error: "Warranty claim not found" });
      }
      res.json(claim);
    } catch (error) {
      res.status(500).json({ error: "Failed to update warranty claim" });
    }
  });

  app.get("/api/battery-health", async (_req, res) => {
    try {
      const records = await storage.getBatteryHealthRecords();
      res.json(records);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch battery health records" });
    }
  });

  app.post("/api/battery-health", async (req, res) => {
    try {
      const record = await storage.createBatteryHealth(req.body);
      res.status(201).json(record);
    } catch (error) {
      res.status(500).json({ error: "Failed to create battery health record" });
    }
  });

  // Users routes (for demo - returns in-memory list)
  const demoUsers = [
    { id: 1, employeeId: "EMP-001", name: "Admin User", email: "admin@zforce.in", phone: "+91 9876543210", role: "admin", status: "active" },
    { id: 2, employeeId: "EMP-002", name: "Dealer Manager", email: "dealer@zforce.in", phone: "+91 9876543211", role: "dealer_owner", dealerId: "dealer-1", status: "active" },
    { id: 3, employeeId: "EMP-003", name: "Service Tech", email: "tech@zforce.in", phone: "+91 9876543212", role: "technician", dealerId: "dealer-1", status: "active" },
  ];

  app.get("/api/users", async (_req, res) => {
    try {
      res.json(demoUsers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      const newUser = {
        id: demoUsers.length + 1,
        ...req.body,
        status: req.body.status || "active",
      };
      demoUsers.push(newUser);
      res.status(201).json(newUser);
    } catch (error) {
      res.status(500).json({ error: "Failed to create user" });
    }
  });

  // Auth routes (for demo)
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password, role } = req.body;
      // Demo authentication - accept demo credentials
      if (username && password) {
        res.json({ success: true, user: { username, role }, message: "Login successful" });
      } else {
        res.status(401).json({ error: "Invalid credentials" });
      }
    } catch (error) {
      res.status(500).json({ error: "Login failed" });
    }
  });

  return httpServer;
}
