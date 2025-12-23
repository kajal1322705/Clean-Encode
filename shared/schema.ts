import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("dealer"),
  name: text("name").notNull(),
  email: text("email"),
  dealerId: varchar("dealer_id"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  role: true,
  name: true,
  email: true,
  dealerId: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const dealers = pgTable("dealers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  location: text("location").notNull(),
  region: text("region").notNull(),
  status: text("status").notNull().default("active"),
  contactPerson: text("contact_person"),
  phone: text("phone"),
  email: text("email"),
});

export const insertDealerSchema = createInsertSchema(dealers).omit({ id: true });
export type InsertDealer = z.infer<typeof insertDealerSchema>;
export type Dealer = typeof dealers.$inferSelect;

export const bookings = pgTable("bookings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bookingNumber: text("booking_number").notNull().unique(),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  customerEmail: text("customer_email"),
  vehicleModel: text("vehicle_model").notNull(),
  variant: text("variant").notNull(),
  color: text("color").notNull(),
  bookingAmount: integer("booking_amount").notNull(),
  status: text("status").notNull().default("pending"),
  dealerId: varchar("dealer_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  expectedDelivery: timestamp("expected_delivery"),
  vin: text("vin"),
  kycStatus: text("kyc_status").default("pending"),
});

export const insertBookingSchema = createInsertSchema(bookings).omit({ id: true, createdAt: true });
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Booking = typeof bookings.$inferSelect;

export const jobCards = pgTable("job_cards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  jobNumber: text("job_number").notNull().unique(),
  vehicleNumber: text("vehicle_number").notNull(),
  vin: text("vin").notNull(),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  serviceType: text("service_type").notNull(),
  complaints: text("complaints").notNull(),
  status: text("status").notNull().default("open"),
  technicianId: varchar("technician_id"),
  technicianName: text("technician_name"),
  dealerId: varchar("dealer_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  estimatedCompletion: timestamp("estimated_completion"),
  completedAt: timestamp("completed_at"),
  laborCost: integer("labor_cost"),
  partsCost: integer("parts_cost"),
  priority: text("priority").default("normal"),
});

export const insertJobCardSchema = createInsertSchema(jobCards).omit({ id: true, createdAt: true });
export type InsertJobCard = z.infer<typeof insertJobCardSchema>;
export type JobCard = typeof jobCards.$inferSelect;

export const inventory = pgTable("inventory", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vin: text("vin").notNull().unique(),
  model: text("model").notNull(),
  variant: text("variant").notNull(),
  color: text("color").notNull(),
  status: text("status").notNull().default("in_transit"),
  dealerId: varchar("dealer_id"),
  arrivalDate: timestamp("arrival_date"),
  allocatedTo: varchar("allocated_to"),
});

export const insertInventorySchema = createInsertSchema(inventory).omit({ id: true });
export type InsertInventory = z.infer<typeof insertInventorySchema>;
export type Inventory = typeof inventory.$inferSelect;

export const spares = pgTable("spares", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  partNumber: text("part_number").notNull().unique(),
  partName: text("part_name").notNull(),
  category: text("category").notNull(),
  quantity: integer("quantity").notNull().default(0),
  minStock: integer("min_stock").notNull().default(5),
  unitPrice: integer("unit_price").notNull(),
  dealerId: varchar("dealer_id").notNull(),
  binLocation: text("bin_location"),
});

export const insertSpareSchema = createInsertSchema(spares).omit({ id: true });
export type InsertSpare = z.infer<typeof insertSpareSchema>;
export type Spare = typeof spares.$inferSelect;

export const warrantyClaims = pgTable("warranty_claims", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  claimNumber: text("claim_number").notNull().unique(),
  vin: text("vin").notNull(),
  vehicleNumber: text("vehicle_number").notNull(),
  customerName: text("customer_name").notNull(),
  claimType: text("claim_type").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull().default("pending"),
  dealerId: varchar("dealer_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  approvedAt: timestamp("approved_at"),
  rejectedAt: timestamp("rejected_at"),
  rejectionReason: text("rejection_reason"),
  claimAmount: integer("claim_amount"),
  approvedAmount: integer("approved_amount"),
});

export const insertWarrantyClaimSchema = createInsertSchema(warrantyClaims).omit({ id: true, createdAt: true });
export type InsertWarrantyClaim = z.infer<typeof insertWarrantyClaimSchema>;
export type WarrantyClaim = typeof warrantyClaims.$inferSelect;

export const leads = pgTable("leads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  source: text("source").notNull(),
  interestedModel: text("interested_model"),
  status: text("status").notNull().default("new"),
  assignedTo: varchar("assigned_to"),
  dealerId: varchar("dealer_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  lastFollowUp: timestamp("last_follow_up"),
  nextFollowUp: timestamp("next_follow_up"),
  notes: text("notes"),
});

export const insertLeadSchema = createInsertSchema(leads).omit({ id: true, createdAt: true });
export type InsertLead = z.infer<typeof insertLeadSchema>;
export type Lead = typeof leads.$inferSelect;

export interface DashboardStats {
  totalBookings: number;
  pendingDeliveries: number;
  activeJobCards: number;
  monthlyRevenue: number;
  bookingsTrend: number;
  deliveriesTrend: number;
  serviceTrend: number;
  revenueTrend: number;
}

export interface SalesTrend {
  month: string;
  bookings: number;
  deliveries: number;
}

export interface ServiceMetrics {
  month: string;
  completed: number;
  pending: number;
}
