import { z } from "zod";
import {
  BookingStatus,
  JobCardStatus,
  WarrantyClaimStatus,
  LeadStatus,
  BOOKING_STATUS_TRANSITIONS,
  JOB_CARD_STATUS_TRANSITIONS,
  WARRANTY_STATUS_TRANSITIONS,
  canTransitionTo,
  isValidIndianMobile,
  formatPhoneE164,
  generateUniqueCode,
  calculateGST,
  type BookingStatusType,
  type JobCardStatusType,
  type WarrantyClaimStatusType,
} from "@shared/utils/international";

export const phoneValidation = z.string().refine(isValidIndianMobile, {
  message: "Invalid Indian mobile number. Must be 10 digits starting with 6-9.",
});

export const emailValidation = z.string().email().optional().nullable();

export const amountValidation = z.number().min(0, "Amount must be non-negative");

export const createBookingValidation = z.object({
  customerName: z.string().min(2, "Name must be at least 2 characters"),
  customerPhone: phoneValidation,
  customerEmail: emailValidation,
  vehicleModel: z.string().min(1, "Vehicle model is required"),
  variant: z.string().min(1, "Variant is required"),
  color: z.string().min(1, "Color is required"),
  bookingAmount: amountValidation,
  dealerId: z.string().uuid("Invalid dealer ID"),
  expectedDelivery: z.string().datetime().optional(),
  vin: z.string().optional(),
  kycStatus: z.enum(["pending", "in_progress", "approved", "rejected"]).default("pending"),
  status: z.enum(["draft", "pending", "confirmed", "allocated", "ready_for_delivery", "delivered", "cancelled"]).default("pending"),
});

export const updateBookingValidation = createBookingValidation.partial().extend({
  status: z.enum(["draft", "pending", "confirmed", "allocated", "ready_for_delivery", "delivered", "cancelled"]).optional(),
});

export const createJobCardValidation = z.object({
  vehicleNumber: z.string().min(1, "Vehicle number is required"),
  vin: z.string().min(1, "VIN is required"),
  customerName: z.string().min(2, "Customer name is required"),
  customerPhone: phoneValidation,
  serviceType: z.enum([
    "regular_service",
    "battery_check",
    "electrical",
    "body_repair",
    "accidental",
    "warranty_repair",
    "free_service",
    "paid_service",
  ]),
  complaints: z.string().min(5, "Complaints must be at least 5 characters"),
  dealerId: z.string().uuid("Invalid dealer ID"),
  technicianId: z.string().optional(),
  technicianName: z.string().optional(),
  estimatedCompletion: z.string().datetime().optional(),
  priority: z.enum(["low", "normal", "high", "critical"]).default("normal"),
  status: z.enum(["open", "in_progress", "pending_parts", "completed", "invoiced", "closed"]).default("open"),
});

export const updateJobCardValidation = createJobCardValidation.partial().extend({
  laborCost: amountValidation.optional(),
  partsCost: amountValidation.optional(),
  completedAt: z.string().datetime().optional(),
});

export const createWarrantyClaimValidation = z.object({
  vin: z.string().min(1, "VIN is required"),
  vehicleNumber: z.string().min(1, "Vehicle number is required"),
  customerName: z.string().min(2, "Customer name is required"),
  claimType: z.enum(["battery", "motor", "controller", "charger", "body", "electrical", "other"]),
  description: z.string().min(10, "Description must be at least 10 characters"),
  claimAmount: amountValidation,
  dealerId: z.string().uuid("Invalid dealer ID"),
  status: z.enum(["draft", "submitted", "under_review", "approved", "partially_approved", "rejected", "reimbursed"]).default("draft"),
});

export const updateWarrantyClaimValidation = createWarrantyClaimValidation.partial().extend({
  approvedAmount: amountValidation.optional(),
  rejectionReason: z.string().optional(),
});

export const createLeadValidation = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: phoneValidation,
  email: emailValidation,
  source: z.enum(["walk_in", "website", "referral", "social_media", "advertisement", "event", "other"]),
  interestedModel: z.string().optional(),
  dealerId: z.string().uuid("Invalid dealer ID"),
  assignedTo: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(["new", "contacted", "interested", "hot", "warm", "cold", "converted", "lost"]).default("new"),
});

export const createTestRideValidation = z.object({
  customerName: z.string().min(2, "Customer name is required"),
  customerPhone: phoneValidation,
  vehicleModel: z.string().min(1, "Vehicle model is required"),
  scheduledDate: z.string().datetime(),
  salesperson: z.string().optional(),
  dealerId: z.string().uuid("Invalid dealer ID"),
  status: z.enum(["scheduled", "completed", "cancelled", "no_show"]).default("scheduled"),
});

export const createSpareValidation = z.object({
  partNumber: z.string().min(1, "Part number is required"),
  partName: z.string().min(1, "Part name is required"),
  category: z.enum(["battery", "motor", "controller", "charger", "body", "electrical", "accessories", "consumables"]),
  quantity: z.number().int().min(0, "Quantity must be non-negative"),
  minStock: z.number().int().min(0, "Minimum stock must be non-negative"),
  unitPrice: amountValidation,
  dealerId: z.string().uuid("Invalid dealer ID"),
  binLocation: z.string().optional(),
});

export const createDealerValidation = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  code: z.string().min(3, "Code must be at least 3 characters"),
  location: z.string().min(1, "Location is required"),
  region: z.enum(["North", "South", "East", "West", "Central"]),
  status: z.enum(["active", "inactive", "suspended"]).default("active"),
  contactPerson: z.string().optional(),
  phone: phoneValidation.optional(),
  email: emailValidation,
});

export class BookingWorkflow {
  static validateTransition(currentStatus: BookingStatusType, newStatus: BookingStatusType): boolean {
    return canTransitionTo(currentStatus, newStatus, BOOKING_STATUS_TRANSITIONS);
  }

  static getNextStatuses(currentStatus: BookingStatusType): BookingStatusType[] {
    return BOOKING_STATUS_TRANSITIONS[currentStatus] || [];
  }

  static canAllocate(booking: { status: string; kycStatus?: string | null }): boolean {
    return booking.status === BookingStatus.CONFIRMED && booking.kycStatus === "approved";
  }

  static canDeliver(booking: { status: string; vin?: string | null }): boolean {
    return booking.status === BookingStatus.READY_FOR_DELIVERY && !!booking.vin;
  }
}

export class JobCardWorkflow {
  static validateTransition(currentStatus: JobCardStatusType, newStatus: JobCardStatusType): boolean {
    return canTransitionTo(currentStatus, newStatus, JOB_CARD_STATUS_TRANSITIONS);
  }

  static getNextStatuses(currentStatus: JobCardStatusType): JobCardStatusType[] {
    return JOB_CARD_STATUS_TRANSITIONS[currentStatus] || [];
  }

  static canAssignTechnician(jobCard: { status: string }): boolean {
    return jobCard.status === JobCardStatus.OPEN || jobCard.status === JobCardStatus.PENDING_PARTS;
  }

  static canComplete(jobCard: { status: string; technicianId?: string | null }): boolean {
    return jobCard.status === JobCardStatus.IN_PROGRESS && !!jobCard.technicianId;
  }

  static calculateTotalCost(laborCost: number, partsCost: number, isInterState: boolean = false): ReturnType<typeof calculateGST> {
    const baseAmount = laborCost + partsCost;
    return calculateGST(baseAmount, isInterState);
  }
}

export class WarrantyWorkflow {
  static validateTransition(currentStatus: WarrantyClaimStatusType, newStatus: WarrantyClaimStatusType): boolean {
    return canTransitionTo(currentStatus, newStatus, WARRANTY_STATUS_TRANSITIONS);
  }

  static getNextStatuses(currentStatus: WarrantyClaimStatusType): WarrantyClaimStatusType[] {
    return WARRANTY_STATUS_TRANSITIONS[currentStatus] || [];
  }

  static canApprove(claim: { status: string }): boolean {
    return claim.status === WarrantyClaimStatus.UNDER_REVIEW;
  }

  static canReimburse(claim: { status: string; approvedAmount?: number | null }): boolean {
    return (
      (claim.status === WarrantyClaimStatus.APPROVED || claim.status === WarrantyClaimStatus.PARTIALLY_APPROVED) &&
      !!claim.approvedAmount && claim.approvedAmount > 0
    );
  }
}

export class InventoryService {
  static canAllocate(inventory: { status: string }): boolean {
    return inventory.status === "in_stock";
  }

  static isLowStock(spare: { quantity: number; minStock: number }): boolean {
    return spare.quantity <= spare.minStock;
  }

  static calculateReorderQuantity(spare: { quantity: number; minStock: number }, reorderMultiplier: number = 3): number {
    if (spare.quantity >= spare.minStock) return 0;
    return (spare.minStock * reorderMultiplier) - spare.quantity;
  }
}

export function normalizePhone(phone: string): string {
  return formatPhoneE164(phone);
}

export function generateBookingNumber(): string {
  return generateUniqueCode("BK");
}

export function generateJobNumber(): string {
  return generateUniqueCode("JC");
}

export function generateClaimNumber(): string {
  return generateUniqueCode("WC");
}

export function generateComplaintNumber(): string {
  return generateUniqueCode("CMP");
}

export function generateLeadNumber(): string {
  return generateUniqueCode("LD");
}

export function generateGRNNumber(): string {
  return generateUniqueCode("GRN");
}

export function generateOrderNumber(): string {
  return generateUniqueCode("SO");
}
