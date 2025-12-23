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

export const insertBookingSchema = createInsertSchema(bookings).omit({ id: true, createdAt: true, bookingNumber: true });
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

export const insertJobCardSchema = createInsertSchema(jobCards).omit({ id: true, createdAt: true, jobNumber: true });
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

export const testRides = pgTable("test_rides", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  vehicleModel: text("vehicle_model").notNull(),
  scheduledDate: timestamp("scheduled_date").notNull(),
  status: text("status").notNull().default("scheduled"),
  salesperson: text("salesperson"),
  feedback: text("feedback"),
  conversionStatus: text("conversion_status").default("pending"),
  dealerId: varchar("dealer_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertTestRideSchema = createInsertSchema(testRides).omit({ id: true, createdAt: true });
export type InsertTestRide = z.infer<typeof insertTestRideSchema>;
export type TestRide = typeof testRides.$inferSelect;

export const deliveries = pgTable("deliveries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bookingId: varchar("booking_id").notNull(),
  vin: text("vin").notNull(),
  batterySerial: text("battery_serial"),
  chargerSerial: text("charger_serial"),
  insuranceDetails: text("insurance_details"),
  registrationNumber: text("registration_number"),
  deliveryDate: timestamp("delivery_date"),
  pdiStatus: text("pdi_status").default("pending"),
  accessoriesDelivered: boolean("accessories_delivered").default(false),
  documentsHandedOver: boolean("documents_handed_over").default(false),
  customerSignature: text("customer_signature"),
  status: text("status").notNull().default("pending"),
  dealerId: varchar("dealer_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertDeliverySchema = createInsertSchema(deliveries).omit({ id: true, createdAt: true });
export type InsertDelivery = z.infer<typeof insertDeliverySchema>;
export type Delivery = typeof deliveries.$inferSelect;

export const complaints = pgTable("complaints", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  complaintNumber: text("complaint_number").notNull().unique(),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  vehicleNumber: text("vehicle_number"),
  vin: text("vin"),
  category: text("category").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull().default("open"),
  escalationLevel: integer("escalation_level").default(0),
  assignedTo: varchar("assigned_to"),
  resolution: text("resolution"),
  closedAt: timestamp("closed_at"),
  dealerId: varchar("dealer_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertComplaintSchema = createInsertSchema(complaints).omit({ id: true, createdAt: true, complaintNumber: true });
export type InsertComplaint = z.infer<typeof insertComplaintSchema>;
export type Complaint = typeof complaints.$inferSelect;

export const grn = pgTable("grn", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  grnNumber: text("grn_number").notNull().unique(),
  supplier: text("supplier").notNull(),
  partsList: text("parts_list").notNull(),
  quantityReceived: integer("quantity_received").notNull(),
  damageQty: integer("damage_qty").default(0),
  receivedDate: timestamp("received_date").defaultNow(),
  status: text("status").notNull().default("received"),
  dealerId: varchar("dealer_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertGrnSchema = createInsertSchema(grn).omit({ id: true, createdAt: true, grnNumber: true });
export type InsertGrn = z.infer<typeof insertGrnSchema>;
export type Grn = typeof grn.$inferSelect;

export const spareOrders = pgTable("spare_orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderNumber: text("order_number").notNull().unique(),
  partsList: text("parts_list").notNull(),
  requestedQty: integer("requested_qty").notNull(),
  approvedQty: integer("approved_qty"),
  status: text("status").notNull().default("pending"),
  dispatchStatus: text("dispatch_status").default("pending"),
  dealerId: varchar("dealer_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertSpareOrderSchema = createInsertSchema(spareOrders).omit({ id: true, createdAt: true, orderNumber: true });
export type InsertSpareOrder = z.infer<typeof insertSpareOrderSchema>;
export type SpareOrder = typeof spareOrders.$inferSelect;

export const batteryHealth = pgTable("battery_health", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vin: text("vin").notNull(),
  batteryId: text("battery_id").notNull(),
  sohPercent: integer("soh_percent"),
  chargeCycles: integer("charge_cycles"),
  temperatureLog: text("temperature_log"),
  errorCodes: text("error_codes"),
  warrantyStatus: text("warranty_status").default("active"),
  lastChecked: timestamp("last_checked").defaultNow(),
  dealerId: varchar("dealer_id").notNull(),
});

export const insertBatteryHealthSchema = createInsertSchema(batteryHealth).omit({ id: true });
export type InsertBatteryHealth = z.infer<typeof insertBatteryHealthSchema>;
export type BatteryHealth = typeof batteryHealth.$inferSelect;

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
