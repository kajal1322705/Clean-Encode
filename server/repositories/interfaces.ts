import type {
  User, InsertUser,
  Dealer, InsertDealer,
  Booking, InsertBooking,
  JobCard, InsertJobCard,
  Inventory, InsertInventory,
  Spare, InsertSpare,
  WarrantyClaim, InsertWarrantyClaim,
  Lead, InsertLead,
  TestRide, InsertTestRide,
  Delivery, InsertDelivery,
  Complaint, InsertComplaint,
  Grn, InsertGrn,
  SpareOrder, InsertSpareOrder,
  BatteryHealth, InsertBatteryHealth,
  AuditLog, InsertAuditLog,
} from "@shared/schema";

export interface AuditContext {
  userId: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface QueryOptions {
  page?: number;
  limit?: number;
  status?: string;
  dealerId?: string;
  search?: string;
  includeDeleted?: boolean;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

export interface IRepository<T, TInsert> {
  findById(id: string, includeDeleted?: boolean): Promise<T | undefined>;
  findAll(options?: QueryOptions): Promise<PaginatedResult<T>>;
  create(data: TInsert, audit: AuditContext): Promise<T>;
  update(id: string, data: Partial<T>, audit: AuditContext): Promise<T | undefined>;
  delete(id: string, audit: AuditContext): Promise<boolean>;
  hardDelete(id: string): Promise<boolean>;
  restore(id: string, audit: AuditContext): Promise<T | undefined>;
}

export interface IUserRepository extends IRepository<User, InsertUser> {
  findByUsername(username: string): Promise<User | undefined>;
  findByDealerId(dealerId: string): Promise<User[]>;
}

export interface IDealerRepository extends IRepository<Dealer, InsertDealer> {
  findByCode(code: string): Promise<Dealer | undefined>;
  findByRegion(region: string): Promise<Dealer[]>;
}

export interface IBookingRepository extends IRepository<Booking, InsertBooking> {
  findByDealerId(dealerId: string, options?: QueryOptions): Promise<PaginatedResult<Booking>>;
  findByStatus(status: string): Promise<Booking[]>;
  updateStatus(id: string, status: string, audit: AuditContext): Promise<Booking | undefined>;
  generateBookingNumber(): Promise<string>;
}

export interface IJobCardRepository extends IRepository<JobCard, InsertJobCard> {
  findByDealerId(dealerId: string, options?: QueryOptions): Promise<PaginatedResult<JobCard>>;
  findByTechnicianId(technicianId: string): Promise<JobCard[]>;
  findByStatus(status: string): Promise<JobCard[]>;
  updateStatus(id: string, status: string, audit: AuditContext): Promise<JobCard | undefined>;
  generateJobNumber(): Promise<string>;
}

export interface IInventoryRepository extends IRepository<Inventory, InsertInventory> {
  findByVin(vin: string): Promise<Inventory | undefined>;
  findByDealerId(dealerId: string): Promise<Inventory[]>;
  findAvailable(): Promise<Inventory[]>;
}

export interface ISpareRepository extends IRepository<Spare, InsertSpare> {
  findByPartNumber(partNumber: string): Promise<Spare | undefined>;
  findByDealerId(dealerId: string): Promise<Spare[]>;
  findLowStock(): Promise<Spare[]>;
}

export interface IWarrantyClaimRepository extends IRepository<WarrantyClaim, InsertWarrantyClaim> {
  findByDealerId(dealerId: string, options?: QueryOptions): Promise<PaginatedResult<WarrantyClaim>>;
  findByStatus(status: string): Promise<WarrantyClaim[]>;
  updateStatus(id: string, status: string, audit: AuditContext): Promise<WarrantyClaim | undefined>;
  generateClaimNumber(): Promise<string>;
}

export interface ILeadRepository extends IRepository<Lead, InsertLead> {
  findByDealerId(dealerId: string, options?: QueryOptions): Promise<PaginatedResult<Lead>>;
  findByAssignedTo(userId: string): Promise<Lead[]>;
  findByStatus(status: string): Promise<Lead[]>;
}

export interface ITestRideRepository extends IRepository<TestRide, InsertTestRide> {
  findByDealerId(dealerId: string, options?: QueryOptions): Promise<PaginatedResult<TestRide>>;
  findByScheduledDate(date: Date): Promise<TestRide[]>;
}

export interface IDeliveryRepository extends IRepository<Delivery, InsertDelivery> {
  findByBookingId(bookingId: string): Promise<Delivery | undefined>;
  findByDealerId(dealerId: string, options?: QueryOptions): Promise<PaginatedResult<Delivery>>;
}

export interface IComplaintRepository extends IRepository<Complaint, InsertComplaint> {
  findByDealerId(dealerId: string, options?: QueryOptions): Promise<PaginatedResult<Complaint>>;
  findByStatus(status: string): Promise<Complaint[]>;
  generateComplaintNumber(): Promise<string>;
}

export interface IGrnRepository extends IRepository<Grn, InsertGrn> {
  findByDealerId(dealerId: string): Promise<Grn[]>;
  generateGrnNumber(): Promise<string>;
}

export interface ISpareOrderRepository extends IRepository<SpareOrder, InsertSpareOrder> {
  findByDealerId(dealerId: string): Promise<SpareOrder[]>;
  findByStatus(status: string): Promise<SpareOrder[]>;
  generateOrderNumber(): Promise<string>;
}

export interface IBatteryHealthRepository extends IRepository<BatteryHealth, InsertBatteryHealth> {
  findByVin(vin: string): Promise<BatteryHealth[]>;
  findByDealerId(dealerId: string): Promise<BatteryHealth[]>;
}

export interface IAuditLogRepository {
  create(data: InsertAuditLog): Promise<AuditLog>;
  findByEntityId(entityId: string): Promise<AuditLog[]>;
  findByEntityType(entityType: string): Promise<AuditLog[]>;
  findByChangedBy(userId: string): Promise<AuditLog[]>;
}

export interface IDatabase {
  users: IUserRepository;
  dealers: IDealerRepository;
  bookings: IBookingRepository;
  jobCards: IJobCardRepository;
  inventory: IInventoryRepository;
  spares: ISpareRepository;
  warrantyClaims: IWarrantyClaimRepository;
  leads: ILeadRepository;
  testRides: ITestRideRepository;
  deliveries: IDeliveryRepository;
  complaints: IComplaintRepository;
  grn: IGrnRepository;
  spareOrders: ISpareOrderRepository;
  batteryHealth: IBatteryHealthRepository;
  auditLogs: IAuditLogRepository;
}
