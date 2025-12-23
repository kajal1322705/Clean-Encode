import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ============================================================
// Audit Fields - Common fields for tracking changes
// ============================================================
export interface AuditFields {
  createdAt: Date | null;
  createdBy: string | null;
  updatedAt: Date | null;
  updatedBy: string | null;
  visible: number;
}

// Base entity with audit fields
export interface BaseEntity extends AuditFields {
  id: string;
}

// ============================================================
// USERS TABLE
// ============================================================
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("dealer"),
  name: text("name").notNull(),
  email: text("email"),
  dealerId: varchar("dealer_id"),
  createdAt: timestamp("created_at").defaultNow(),
  createdBy: varchar("created_by"),
  updatedAt: timestamp("updated_at").defaultNow(),
  updatedBy: varchar("updated_by"),
  visible: integer("visible").notNull().default(1),
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

// ============================================================
// DEALERS TABLE
// ============================================================
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
  createdAt: timestamp("created_at").defaultNow(),
  createdBy: varchar("created_by"),
  updatedAt: timestamp("updated_at").defaultNow(),
  updatedBy: varchar("updated_by"),
  visible: integer("visible").notNull().default(1),
});

export const insertDealerSchema = createInsertSchema(dealers).omit({ 
  id: true, 
  createdAt: true, 
  createdBy: true, 
  updatedAt: true, 
  updatedBy: true, 
  visible: true 
});
export type InsertDealer = z.infer<typeof insertDealerSchema>;
export type Dealer = typeof dealers.$inferSelect;

// ============================================================
// BOOKINGS TABLE
// ============================================================
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
  createdBy: varchar("created_by"),
  updatedAt: timestamp("updated_at").defaultNow(),
  updatedBy: varchar("updated_by"),
  visible: integer("visible").notNull().default(1),
  expectedDelivery: timestamp("expected_delivery"),
  vin: text("vin"),
  kycStatus: text("kyc_status").default("pending"),
});

export const insertBookingSchema = createInsertSchema(bookings).omit({ 
  id: true, 
  createdAt: true, 
  createdBy: true, 
  updatedAt: true, 
  updatedBy: true, 
  visible: true,
  bookingNumber: true 
});
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Booking = typeof bookings.$inferSelect;

// ============================================================
// JOB CARDS TABLE
// ============================================================
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
  createdBy: varchar("created_by"),
  updatedAt: timestamp("updated_at").defaultNow(),
  updatedBy: varchar("updated_by"),
  visible: integer("visible").notNull().default(1),
  estimatedCompletion: timestamp("estimated_completion"),
  completedAt: timestamp("completed_at"),
  laborCost: integer("labor_cost"),
  partsCost: integer("parts_cost"),
  priority: text("priority").default("normal"),
});

export const insertJobCardSchema = createInsertSchema(jobCards).omit({ 
  id: true, 
  createdAt: true, 
  createdBy: true, 
  updatedAt: true, 
  updatedBy: true, 
  visible: true,
  jobNumber: true 
});
export type InsertJobCard = z.infer<typeof insertJobCardSchema>;
export type JobCard = typeof jobCards.$inferSelect;

// ============================================================
// INVENTORY TABLE
// ============================================================
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
  createdAt: timestamp("created_at").defaultNow(),
  createdBy: varchar("created_by"),
  updatedAt: timestamp("updated_at").defaultNow(),
  updatedBy: varchar("updated_by"),
  visible: integer("visible").notNull().default(1),
});

export const insertInventorySchema = createInsertSchema(inventory).omit({ 
  id: true, 
  createdAt: true, 
  createdBy: true, 
  updatedAt: true, 
  updatedBy: true, 
  visible: true 
});
export type InsertInventory = z.infer<typeof insertInventorySchema>;
export type Inventory = typeof inventory.$inferSelect;

// ============================================================
// SPARES TABLE
// ============================================================
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
  createdAt: timestamp("created_at").defaultNow(),
  createdBy: varchar("created_by"),
  updatedAt: timestamp("updated_at").defaultNow(),
  updatedBy: varchar("updated_by"),
  visible: integer("visible").notNull().default(1),
});

export const insertSpareSchema = createInsertSchema(spares).omit({ 
  id: true, 
  createdAt: true, 
  createdBy: true, 
  updatedAt: true, 
  updatedBy: true, 
  visible: true 
});
export type InsertSpare = z.infer<typeof insertSpareSchema>;
export type Spare = typeof spares.$inferSelect;

// ============================================================
// WARRANTY CLAIMS TABLE
// ============================================================
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
  createdBy: varchar("created_by"),
  updatedAt: timestamp("updated_at").defaultNow(),
  updatedBy: varchar("updated_by"),
  visible: integer("visible").notNull().default(1),
  approvedAt: timestamp("approved_at"),
  rejectedAt: timestamp("rejected_at"),
  rejectionReason: text("rejection_reason"),
  claimAmount: integer("claim_amount"),
  approvedAmount: integer("approved_amount"),
});

export const insertWarrantyClaimSchema = createInsertSchema(warrantyClaims).omit({ 
  id: true, 
  createdAt: true, 
  createdBy: true, 
  updatedAt: true, 
  updatedBy: true, 
  visible: true,
  claimNumber: true 
});
export type InsertWarrantyClaim = z.infer<typeof insertWarrantyClaimSchema>;
export type WarrantyClaim = typeof warrantyClaims.$inferSelect;

// ============================================================
// LEADS TABLE
// ============================================================
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
  createdBy: varchar("created_by"),
  updatedAt: timestamp("updated_at").defaultNow(),
  updatedBy: varchar("updated_by"),
  visible: integer("visible").notNull().default(1),
  lastFollowUp: timestamp("last_follow_up"),
  nextFollowUp: timestamp("next_follow_up"),
  notes: text("notes"),
});

export const insertLeadSchema = createInsertSchema(leads).omit({ 
  id: true, 
  createdAt: true, 
  createdBy: true, 
  updatedAt: true, 
  updatedBy: true, 
  visible: true 
});
export type InsertLead = z.infer<typeof insertLeadSchema>;
export type Lead = typeof leads.$inferSelect;

// ============================================================
// TEST RIDES TABLE
// ============================================================
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
  createdBy: varchar("created_by"),
  updatedAt: timestamp("updated_at").defaultNow(),
  updatedBy: varchar("updated_by"),
  visible: integer("visible").notNull().default(1),
});

export const insertTestRideSchema = createInsertSchema(testRides).omit({ 
  id: true, 
  createdAt: true, 
  createdBy: true, 
  updatedAt: true, 
  updatedBy: true, 
  visible: true 
});
export type InsertTestRide = z.infer<typeof insertTestRideSchema>;
export type TestRide = typeof testRides.$inferSelect;

// ============================================================
// DELIVERIES TABLE
// ============================================================
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
  createdBy: varchar("created_by"),
  updatedAt: timestamp("updated_at").defaultNow(),
  updatedBy: varchar("updated_by"),
  visible: integer("visible").notNull().default(1),
});

export const insertDeliverySchema = createInsertSchema(deliveries).omit({ 
  id: true, 
  createdAt: true, 
  createdBy: true, 
  updatedAt: true, 
  updatedBy: true, 
  visible: true 
});
export type InsertDelivery = z.infer<typeof insertDeliverySchema>;
export type Delivery = typeof deliveries.$inferSelect;

// ============================================================
// COMPLAINTS TABLE
// ============================================================
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
  createdBy: varchar("created_by"),
  updatedAt: timestamp("updated_at").defaultNow(),
  updatedBy: varchar("updated_by"),
  visible: integer("visible").notNull().default(1),
});

export const insertComplaintSchema = createInsertSchema(complaints).omit({ 
  id: true, 
  createdAt: true, 
  createdBy: true, 
  updatedAt: true, 
  updatedBy: true, 
  visible: true,
  complaintNumber: true 
});
export type InsertComplaint = z.infer<typeof insertComplaintSchema>;
export type Complaint = typeof complaints.$inferSelect;

// ============================================================
// GRN (Goods Receipt Note) TABLE
// ============================================================
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
  createdBy: varchar("created_by"),
  updatedAt: timestamp("updated_at").defaultNow(),
  updatedBy: varchar("updated_by"),
  visible: integer("visible").notNull().default(1),
});

export const insertGrnSchema = createInsertSchema(grn).omit({ 
  id: true, 
  createdAt: true, 
  createdBy: true, 
  updatedAt: true, 
  updatedBy: true, 
  visible: true,
  grnNumber: true 
});
export type InsertGrn = z.infer<typeof insertGrnSchema>;
export type Grn = typeof grn.$inferSelect;

// ============================================================
// SPARE ORDERS TABLE
// ============================================================
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
  createdBy: varchar("created_by"),
  updatedAt: timestamp("updated_at").defaultNow(),
  updatedBy: varchar("updated_by"),
  visible: integer("visible").notNull().default(1),
});

export const insertSpareOrderSchema = createInsertSchema(spareOrders).omit({ 
  id: true, 
  createdAt: true, 
  createdBy: true, 
  updatedAt: true, 
  updatedBy: true, 
  visible: true,
  orderNumber: true 
});
export type InsertSpareOrder = z.infer<typeof insertSpareOrderSchema>;
export type SpareOrder = typeof spareOrders.$inferSelect;

// ============================================================
// BATTERY HEALTH TABLE
// ============================================================
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
  createdAt: timestamp("created_at").defaultNow(),
  createdBy: varchar("created_by"),
  updatedAt: timestamp("updated_at").defaultNow(),
  updatedBy: varchar("updated_by"),
  visible: integer("visible").notNull().default(1),
});

export const insertBatteryHealthSchema = createInsertSchema(batteryHealth).omit({ 
  id: true, 
  createdAt: true, 
  createdBy: true, 
  updatedAt: true, 
  updatedBy: true, 
  visible: true 
});
export type InsertBatteryHealth = z.infer<typeof insertBatteryHealthSchema>;
export type BatteryHealth = typeof batteryHealth.$inferSelect;

// ============================================================
// AUDIT LOG TABLE - Tracks all changes
// ============================================================
export const auditLogs = pgTable("audit_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  entityType: text("entity_type").notNull(),
  entityId: varchar("entity_id").notNull(),
  action: text("action").notNull(),
  previousData: text("previous_data"),
  newData: text("new_data"),
  changedBy: varchar("changed_by").notNull(),
  changedAt: timestamp("changed_at").defaultNow(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
});

export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({ id: true, changedAt: true });
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type AuditLog = typeof auditLogs.$inferSelect;

// ============================================================
// Dashboard Stats and Metrics Interfaces
// ============================================================
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

// ============================================================
// RBAC - Role-Based Access Control
// ============================================================

export const UserRole = {
  HO_SUPER_ADMIN: "ho_super_admin",
  HO_SALES_ADMIN: "ho_sales_admin",
  HO_SERVICE_ADMIN: "ho_service_admin",
  HO_FINANCE_ADMIN: "ho_finance_admin",
  DEALER_PRINCIPAL: "dealer_principal",
  DEALER_SALES_EXECUTIVE: "dealer_sales_exec",
  SERVICE_MANAGER: "service_manager",
  TECHNICIAN: "technician",
  CRM_EXECUTIVE: "crm_executive",
  FINANCE_EXECUTIVE: "finance_executive",
  CUSTOMER: "customer",
} as const;

export type UserRoleType = typeof UserRole[keyof typeof UserRole];

export const Module = {
  DASHBOARD: "dashboard",
  SALES: "sales",
  SERVICE: "service",
  SPARES: "spares",
  WARRANTY: "warranty",
  CRM: "crm",
  FINANCE: "finance",
  ADMIN: "admin",
} as const;

export type ModuleType = typeof Module[keyof typeof Module];

export const Permission = {
  VIEW: "view",
  CREATE: "create",
  EDIT: "edit",
  DELETE: "delete",
  APPROVE: "approve",
  SUBMIT: "submit",
} as const;

export type PermissionType = typeof Permission[keyof typeof Permission];

// Role permissions matrix
export const rolePermissions: Record<UserRoleType, Record<ModuleType, PermissionType[]>> = {
  [UserRole.HO_SUPER_ADMIN]: {
    [Module.DASHBOARD]: ["view"],
    [Module.SALES]: ["view"],
    [Module.SERVICE]: ["view"],
    [Module.SPARES]: ["view"],
    [Module.WARRANTY]: ["view", "approve"],
    [Module.CRM]: ["view"],
    [Module.FINANCE]: ["view", "approve"],
    [Module.ADMIN]: ["view", "create", "edit", "delete"],
  },
  [UserRole.HO_SALES_ADMIN]: {
    [Module.DASHBOARD]: ["view"],
    [Module.SALES]: ["view", "approve"],
    [Module.SERVICE]: [],
    [Module.SPARES]: [],
    [Module.WARRANTY]: [],
    [Module.CRM]: ["view"],
    [Module.FINANCE]: [],
    [Module.ADMIN]: [],
  },
  [UserRole.HO_SERVICE_ADMIN]: {
    [Module.DASHBOARD]: ["view"],
    [Module.SALES]: [],
    [Module.SERVICE]: ["view", "approve"],
    [Module.SPARES]: ["view"],
    [Module.WARRANTY]: ["view", "approve"],
    [Module.CRM]: [],
    [Module.FINANCE]: [],
    [Module.ADMIN]: [],
  },
  [UserRole.HO_FINANCE_ADMIN]: {
    [Module.DASHBOARD]: ["view"],
    [Module.SALES]: [],
    [Module.SERVICE]: [],
    [Module.SPARES]: [],
    [Module.WARRANTY]: [],
    [Module.CRM]: [],
    [Module.FINANCE]: ["view", "create", "edit", "approve"],
    [Module.ADMIN]: [],
  },
  [UserRole.DEALER_PRINCIPAL]: {
    [Module.DASHBOARD]: ["view"],
    [Module.SALES]: ["view", "create", "edit"],
    [Module.SERVICE]: ["view", "create", "edit"],
    [Module.SPARES]: ["view", "create", "edit"],
    [Module.WARRANTY]: ["view"],
    [Module.CRM]: ["view", "create", "edit"],
    [Module.FINANCE]: ["view"],
    [Module.ADMIN]: [],
  },
  [UserRole.DEALER_SALES_EXECUTIVE]: {
    [Module.DASHBOARD]: ["view"],
    [Module.SALES]: ["view", "create", "edit"],
    [Module.SERVICE]: [],
    [Module.SPARES]: [],
    [Module.WARRANTY]: [],
    [Module.CRM]: ["view", "create", "edit"],
    [Module.FINANCE]: [],
    [Module.ADMIN]: [],
  },
  [UserRole.SERVICE_MANAGER]: {
    [Module.DASHBOARD]: ["view"],
    [Module.SALES]: [],
    [Module.SERVICE]: ["view", "create", "edit"],
    [Module.SPARES]: ["view"],
    [Module.WARRANTY]: ["view", "submit"],
    [Module.CRM]: [],
    [Module.FINANCE]: [],
    [Module.ADMIN]: [],
  },
  [UserRole.TECHNICIAN]: {
    [Module.DASHBOARD]: [],
    [Module.SALES]: [],
    [Module.SERVICE]: ["view", "edit"],
    [Module.SPARES]: [],
    [Module.WARRANTY]: [],
    [Module.CRM]: [],
    [Module.FINANCE]: [],
    [Module.ADMIN]: [],
  },
  [UserRole.CRM_EXECUTIVE]: {
    [Module.DASHBOARD]: ["view"],
    [Module.SALES]: [],
    [Module.SERVICE]: [],
    [Module.SPARES]: [],
    [Module.WARRANTY]: [],
    [Module.CRM]: ["view", "create", "edit"],
    [Module.FINANCE]: [],
    [Module.ADMIN]: [],
  },
  [UserRole.FINANCE_EXECUTIVE]: {
    [Module.DASHBOARD]: ["view"],
    [Module.SALES]: [],
    [Module.SERVICE]: [],
    [Module.SPARES]: [],
    [Module.WARRANTY]: [],
    [Module.CRM]: [],
    [Module.FINANCE]: ["view", "create", "edit"],
    [Module.ADMIN]: [],
  },
  [UserRole.CUSTOMER]: {
    [Module.DASHBOARD]: [],
    [Module.SALES]: [],
    [Module.SERVICE]: ["view"],
    [Module.SPARES]: [],
    [Module.WARRANTY]: ["view"],
    [Module.CRM]: [],
    [Module.FINANCE]: [],
    [Module.ADMIN]: [],
  },
};

// Helper functions for checking permissions
export function hasModuleAccess(role: UserRoleType, module: ModuleType): boolean {
  const permissions = rolePermissions[role]?.[module];
  return permissions && permissions.length > 0;
}

export function hasPermission(role: UserRoleType, module: ModuleType, permission: PermissionType): boolean {
  const permissions = rolePermissions[role]?.[module];
  return permissions?.includes(permission) ?? false;
}

export function getModulesForRole(role: UserRoleType): ModuleType[] {
  const permissions = rolePermissions[role];
  if (!permissions) return [];
  return Object.entries(permissions)
    .filter(([, perms]) => perms.length > 0)
    .map(([module]) => module as ModuleType);
}

export function isHORole(role: UserRoleType): boolean {
  return role.startsWith("ho_");
}

export function isDealerRole(role: UserRoleType): boolean {
  const dealerRoles: UserRoleType[] = [
    UserRole.DEALER_PRINCIPAL,
    UserRole.DEALER_SALES_EXECUTIVE,
    UserRole.SERVICE_MANAGER,
    UserRole.TECHNICIAN,
    UserRole.CRM_EXECUTIVE,
    UserRole.FINANCE_EXECUTIVE,
  ];
  return dealerRoles.includes(role);
}
