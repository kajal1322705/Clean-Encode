import { 
  type User, type InsertUser,
  type Booking, type InsertBooking,
  type JobCard, type InsertJobCard,
  type Inventory, type InsertInventory,
  type Dealer, type InsertDealer,
  type Lead, type InsertLead,
  type TestRide, type InsertTestRide,
  type Complaint, type InsertComplaint,
  type Spare, type InsertSpare,
  type WarrantyClaim, type InsertWarrantyClaim,
  type BatteryHealth, type InsertBatteryHealth,
  type DashboardStats, type SalesTrend, type ServiceMetrics,
  users, bookings, jobCards, inventory, dealers,
  leads, testRides, complaints, spares, warrantyClaims, batteryHealth
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, or, sql, count } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getBookings(): Promise<Booking[]>;
  getBooking(id: string): Promise<Booking | undefined>;
  getRecentBookings(limit: number): Promise<Booking[]>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBooking(id: string, booking: Partial<InsertBooking>): Promise<Booking | undefined>;
  deleteBooking(id: string): Promise<boolean>;
  
  getJobCards(): Promise<JobCard[]>;
  getJobCard(id: string): Promise<JobCard | undefined>;
  getActiveJobCards(): Promise<JobCard[]>;
  createJobCard(jobCard: InsertJobCard): Promise<JobCard>;
  updateJobCard(id: string, jobCard: Partial<InsertJobCard>): Promise<JobCard | undefined>;
  deleteJobCard(id: string): Promise<boolean>;
  
  getInventory(): Promise<Inventory[]>;
  getInventoryByStatus(status: string): Promise<Inventory[]>;
  createInventory(inventory: InsertInventory): Promise<Inventory>;
  updateInventory(id: string, inventory: Partial<InsertInventory>): Promise<Inventory | undefined>;
  
  getDealers(): Promise<Dealer[]>;
  getDealer(id: string): Promise<Dealer | undefined>;
  createDealer(dealer: InsertDealer): Promise<Dealer>;
  
  getLeads(): Promise<Lead[]>;
  getLead(id: string): Promise<Lead | undefined>;
  createLead(lead: InsertLead): Promise<Lead>;
  updateLead(id: string, lead: Partial<InsertLead>): Promise<Lead | undefined>;
  
  getTestRides(): Promise<TestRide[]>;
  getTestRide(id: string): Promise<TestRide | undefined>;
  createTestRide(testRide: InsertTestRide): Promise<TestRide>;
  updateTestRide(id: string, testRide: Partial<InsertTestRide>): Promise<TestRide | undefined>;
  
  getComplaints(): Promise<Complaint[]>;
  getComplaint(id: string): Promise<Complaint | undefined>;
  createComplaint(complaint: InsertComplaint): Promise<Complaint>;
  updateComplaint(id: string, complaint: Partial<InsertComplaint>): Promise<Complaint | undefined>;
  
  getSpares(): Promise<Spare[]>;
  getSpare(id: string): Promise<Spare | undefined>;
  createSpare(spare: InsertSpare): Promise<Spare>;
  updateSpare(id: string, spare: Partial<InsertSpare>): Promise<Spare | undefined>;
  
  getWarrantyClaims(): Promise<WarrantyClaim[]>;
  getWarrantyClaim(id: string): Promise<WarrantyClaim | undefined>;
  createWarrantyClaim(claim: InsertWarrantyClaim): Promise<WarrantyClaim>;
  updateWarrantyClaim(id: string, claim: Partial<InsertWarrantyClaim>): Promise<WarrantyClaim | undefined>;
  
  getBatteryHealthRecords(): Promise<BatteryHealth[]>;
  getBatteryHealth(id: string): Promise<BatteryHealth | undefined>;
  createBatteryHealth(record: InsertBatteryHealth): Promise<BatteryHealth>;
  
  getDashboardStats(): Promise<DashboardStats>;
  getSalesTrend(): Promise<SalesTrend[]>;
  getServiceMetrics(): Promise<ServiceMetrics[]>;
  
  seedData(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getBookings(): Promise<Booking[]> {
    return db.select().from(bookings).orderBy(desc(bookings.createdAt));
  }

  async getBooking(id: string): Promise<Booking | undefined> {
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, id));
    return booking;
  }

  async getRecentBookings(limit: number): Promise<Booking[]> {
    return db.select().from(bookings).orderBy(desc(bookings.createdAt)).limit(limit);
  }

  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const bookingNumber = `BK-${Date.now().toString().slice(-6)}`;
    const [booking] = await db.insert(bookings).values({
      ...insertBooking,
      bookingNumber,
    }).returning();
    return booking;
  }

  async updateBooking(id: string, updates: Partial<InsertBooking>): Promise<Booking | undefined> {
    const [booking] = await db.update(bookings).set(updates).where(eq(bookings.id, id)).returning();
    return booking;
  }

  async deleteBooking(id: string): Promise<boolean> {
    const result = await db.delete(bookings).where(eq(bookings.id, id)).returning();
    return result.length > 0;
  }

  async getJobCards(): Promise<JobCard[]> {
    return db.select().from(jobCards).orderBy(desc(jobCards.createdAt));
  }

  async getJobCard(id: string): Promise<JobCard | undefined> {
    const [jobCard] = await db.select().from(jobCards).where(eq(jobCards.id, id));
    return jobCard;
  }

  async getActiveJobCards(): Promise<JobCard[]> {
    return db.select().from(jobCards)
      .where(or(eq(jobCards.status, "open"), eq(jobCards.status, "in_progress")))
      .orderBy(desc(jobCards.createdAt));
  }

  async createJobCard(insertJobCard: InsertJobCard): Promise<JobCard> {
    const jobNumber = `JC-${Date.now().toString().slice(-6)}`;
    const [jobCard] = await db.insert(jobCards).values({
      ...insertJobCard,
      jobNumber,
    }).returning();
    return jobCard;
  }

  async updateJobCard(id: string, updates: Partial<InsertJobCard>): Promise<JobCard | undefined> {
    const [jobCard] = await db.update(jobCards).set(updates).where(eq(jobCards.id, id)).returning();
    return jobCard;
  }

  async deleteJobCard(id: string): Promise<boolean> {
    const result = await db.delete(jobCards).where(eq(jobCards.id, id)).returning();
    return result.length > 0;
  }

  async getInventory(): Promise<Inventory[]> {
    return db.select().from(inventory);
  }

  async getInventoryByStatus(status: string): Promise<Inventory[]> {
    return db.select().from(inventory).where(eq(inventory.status, status));
  }

  async createInventory(insertInventory: InsertInventory): Promise<Inventory> {
    const [inv] = await db.insert(inventory).values(insertInventory).returning();
    return inv;
  }

  async updateInventory(id: string, updates: Partial<InsertInventory>): Promise<Inventory | undefined> {
    const [inv] = await db.update(inventory).set(updates).where(eq(inventory.id, id)).returning();
    return inv;
  }

  async getDealers(): Promise<Dealer[]> {
    return db.select().from(dealers);
  }

  async getDealer(id: string): Promise<Dealer | undefined> {
    const [dealer] = await db.select().from(dealers).where(eq(dealers.id, id));
    return dealer;
  }

  async createDealer(insertDealer: InsertDealer): Promise<Dealer> {
    const [dealer] = await db.insert(dealers).values(insertDealer).returning();
    return dealer;
  }

  async getLeads(): Promise<Lead[]> {
    return db.select().from(leads).orderBy(desc(leads.createdAt));
  }

  async getLead(id: string): Promise<Lead | undefined> {
    const [lead] = await db.select().from(leads).where(eq(leads.id, id));
    return lead;
  }

  async createLead(insertLead: InsertLead): Promise<Lead> {
    const [lead] = await db.insert(leads).values(insertLead).returning();
    return lead;
  }

  async updateLead(id: string, updates: Partial<InsertLead>): Promise<Lead | undefined> {
    const [lead] = await db.update(leads).set(updates).where(eq(leads.id, id)).returning();
    return lead;
  }

  async getTestRides(): Promise<TestRide[]> {
    return db.select().from(testRides).orderBy(desc(testRides.createdAt));
  }

  async getTestRide(id: string): Promise<TestRide | undefined> {
    const [testRide] = await db.select().from(testRides).where(eq(testRides.id, id));
    return testRide;
  }

  async createTestRide(insertTestRide: InsertTestRide): Promise<TestRide> {
    const [testRide] = await db.insert(testRides).values(insertTestRide).returning();
    return testRide;
  }

  async updateTestRide(id: string, updates: Partial<InsertTestRide>): Promise<TestRide | undefined> {
    const [testRide] = await db.update(testRides).set(updates).where(eq(testRides.id, id)).returning();
    return testRide;
  }

  async getComplaints(): Promise<Complaint[]> {
    return db.select().from(complaints).orderBy(desc(complaints.createdAt));
  }

  async getComplaint(id: string): Promise<Complaint | undefined> {
    const [complaint] = await db.select().from(complaints).where(eq(complaints.id, id));
    return complaint;
  }

  async createComplaint(insertComplaint: InsertComplaint): Promise<Complaint> {
    const complaintNumber = `CMP-${Date.now().toString().slice(-6)}`;
    const [complaint] = await db.insert(complaints).values({
      ...insertComplaint,
      complaintNumber,
    }).returning();
    return complaint;
  }

  async updateComplaint(id: string, updates: Partial<InsertComplaint>): Promise<Complaint | undefined> {
    const [complaint] = await db.update(complaints).set(updates).where(eq(complaints.id, id)).returning();
    return complaint;
  }

  async getSpares(): Promise<Spare[]> {
    return db.select().from(spares);
  }

  async getSpare(id: string): Promise<Spare | undefined> {
    const [spare] = await db.select().from(spares).where(eq(spares.id, id));
    return spare;
  }

  async createSpare(insertSpare: InsertSpare): Promise<Spare> {
    const [spare] = await db.insert(spares).values(insertSpare).returning();
    return spare;
  }

  async updateSpare(id: string, updates: Partial<InsertSpare>): Promise<Spare | undefined> {
    const [spare] = await db.update(spares).set(updates).where(eq(spares.id, id)).returning();
    return spare;
  }

  async getWarrantyClaims(): Promise<WarrantyClaim[]> {
    return db.select().from(warrantyClaims).orderBy(desc(warrantyClaims.createdAt));
  }

  async getWarrantyClaim(id: string): Promise<WarrantyClaim | undefined> {
    const [claim] = await db.select().from(warrantyClaims).where(eq(warrantyClaims.id, id));
    return claim;
  }

  async createWarrantyClaim(insertClaim: InsertWarrantyClaim): Promise<WarrantyClaim> {
    const claimNumber = `WC-${Date.now().toString().slice(-6)}`;
    const [claim] = await db.insert(warrantyClaims).values({
      ...insertClaim,
      claimNumber,
    }).returning();
    return claim;
  }

  async updateWarrantyClaim(id: string, updates: Partial<InsertWarrantyClaim>): Promise<WarrantyClaim | undefined> {
    const [claim] = await db.update(warrantyClaims).set(updates).where(eq(warrantyClaims.id, id)).returning();
    return claim;
  }

  async getBatteryHealthRecords(): Promise<BatteryHealth[]> {
    return db.select().from(batteryHealth);
  }

  async getBatteryHealth(id: string): Promise<BatteryHealth | undefined> {
    const [record] = await db.select().from(batteryHealth).where(eq(batteryHealth.id, id));
    return record;
  }

  async createBatteryHealth(insertRecord: InsertBatteryHealth): Promise<BatteryHealth> {
    const [record] = await db.insert(batteryHealth).values(insertRecord).returning();
    return record;
  }

  async getDashboardStats(): Promise<DashboardStats> {
    const allBookings = await db.select().from(bookings);
    const allJobCards = await db.select().from(jobCards);
    
    const totalBookings = allBookings.length;
    const pendingDeliveries = allBookings.filter((b) => b.status === "confirmed").length;
    const activeJobCards = allJobCards.filter((jc) => jc.status === "open" || jc.status === "in_progress").length;
    
    const monthlyRevenue = allBookings
      .filter((b) => b.status === "delivered")
      .reduce((sum, b) => sum + (b.bookingAmount * 10), 0);

    return {
      totalBookings,
      pendingDeliveries,
      activeJobCards,
      monthlyRevenue,
      bookingsTrend: 12,
      deliveriesTrend: 8,
      serviceTrend: -5,
      revenueTrend: 15,
    };
  }

  async getSalesTrend(): Promise<SalesTrend[]> {
    return [
      { month: "Jul", bookings: 28, deliveries: 22 },
      { month: "Aug", bookings: 35, deliveries: 28 },
      { month: "Sep", bookings: 42, deliveries: 35 },
      { month: "Oct", bookings: 38, deliveries: 32 },
      { month: "Nov", bookings: 45, deliveries: 40 },
      { month: "Dec", bookings: 52, deliveries: 45 },
    ];
  }

  async getServiceMetrics(): Promise<ServiceMetrics[]> {
    return [
      { month: "Jul", completed: 45, pending: 8 },
      { month: "Aug", completed: 52, pending: 12 },
      { month: "Sep", completed: 48, pending: 10 },
      { month: "Oct", completed: 55, pending: 6 },
      { month: "Nov", completed: 60, pending: 15 },
      { month: "Dec", completed: 58, pending: 8 },
    ];
  }

  async seedData(): Promise<void> {
    const existingDealers = await db.select().from(dealers);
    if (existingDealers.length > 0) return;

    const [dealer] = await db.insert(dealers).values({
      name: "ZForce Mumbai Central",
      code: "ZF-MUM-001",
      location: "Mumbai",
      region: "West",
      status: "active",
      contactPerson: "John Dealer",
      phone: "9876543210",
      email: "mumbai@zforce.com",
    }).returning();

    await db.insert(bookings).values([
      {
        bookingNumber: "BK-1001",
        customerName: "Rahul Sharma",
        customerPhone: "9876543210",
        customerEmail: "rahul@example.com",
        vehicleModel: "ZForce X1",
        variant: "Pro",
        color: "Pearl White",
        bookingAmount: 15000,
        status: "confirmed",
        dealerId: dealer.id,
        expectedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        vin: "ZF2024X1PRO001234",
        kycStatus: "approved",
      },
      {
        bookingNumber: "BK-1002",
        customerName: "Priya Patel",
        customerPhone: "9876543211",
        customerEmail: "priya@example.com",
        vehicleModel: "ZForce X2 Pro",
        variant: "Max",
        color: "Midnight Black",
        bookingAmount: 20000,
        status: "pending",
        dealerId: dealer.id,
        kycStatus: "pending",
      },
      {
        bookingNumber: "BK-1003",
        customerName: "Amit Kumar",
        customerPhone: "9876543212",
        vehicleModel: "ZForce City",
        variant: "Base",
        color: "Ocean Blue",
        bookingAmount: 10000,
        status: "confirmed",
        dealerId: dealer.id,
        expectedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        vin: "ZF2024CITYBASE5678",
        kycStatus: "approved",
      },
      {
        bookingNumber: "BK-1004",
        customerName: "Sneha Reddy",
        customerPhone: "9876543213",
        customerEmail: "sneha@example.com",
        vehicleModel: "ZForce X1",
        variant: "Plus",
        color: "Lunar Silver",
        bookingAmount: 12000,
        status: "delivered",
        dealerId: dealer.id,
        vin: "ZF2024X1PLUS9012",
        kycStatus: "approved",
      },
    ]);

    await db.insert(jobCards).values([
      {
        jobNumber: "JC-5001",
        vehicleNumber: "MH 12 AB 1234",
        vin: "ZF2024X1PRO001234",
        customerName: "Vikram Singh",
        customerPhone: "9876543220",
        serviceType: "regular_service",
        complaints: "Regular maintenance service at 5000km",
        status: "in_progress",
        technicianId: "tech-1",
        technicianName: "Rajesh Kumar",
        dealerId: dealer.id,
        estimatedCompletion: new Date(Date.now() + 4 * 60 * 60 * 1000),
        priority: "normal",
      },
      {
        jobNumber: "JC-5002",
        vehicleNumber: "MH 01 CD 5678",
        vin: "ZF2024X2MAX003456",
        customerName: "Meera Joshi",
        customerPhone: "9876543221",
        serviceType: "battery_check",
        complaints: "Battery draining faster than expected",
        status: "open",
        dealerId: dealer.id,
        priority: "high",
      },
      {
        jobNumber: "JC-5003",
        vehicleNumber: "MH 04 EF 9012",
        vin: "ZF2024CITYBASE7890",
        customerName: "Arjun Nair",
        customerPhone: "9876543222",
        serviceType: "electrical",
        complaints: "Dashboard display flickering intermittently",
        status: "open",
        dealerId: dealer.id,
        priority: "normal",
      },
      {
        jobNumber: "JC-5004",
        vehicleNumber: "MH 02 GH 3456",
        vin: "ZF2024X1PLUS1234",
        customerName: "Kavita Sharma",
        customerPhone: "9876543223",
        serviceType: "body_repair",
        complaints: "Minor scratch on left door panel",
        status: "completed",
        technicianId: "tech-2",
        technicianName: "Suresh Patil",
        dealerId: dealer.id,
        completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        laborCost: 1500,
        partsCost: 3500,
        priority: "low",
      },
    ]);

    await db.insert(inventory).values([
      {
        vin: "ZF2024X1PRO001234",
        model: "ZForce X1",
        variant: "Pro",
        color: "Pearl White",
        status: "allocated",
        dealerId: dealer.id,
        arrivalDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      },
      {
        vin: "ZF2024X2MAX002345",
        model: "ZForce X2 Pro",
        variant: "Max",
        color: "Midnight Black",
        status: "in_stock",
        dealerId: dealer.id,
        arrivalDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        vin: "ZF2024CITYBASE3456",
        model: "ZForce City",
        variant: "Base",
        color: "Ocean Blue",
        status: "in_transit",
        dealerId: dealer.id,
        arrivalDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      },
      {
        vin: "ZF2024X1PLUS4567",
        model: "ZForce X1",
        variant: "Plus",
        color: "Lunar Silver",
        status: "in_stock",
        dealerId: dealer.id,
        arrivalDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
      {
        vin: "ZF2024CARGO5678",
        model: "ZForce Cargo",
        variant: "Pro",
        color: "Pearl White",
        status: "in_transit",
        dealerId: dealer.id,
        arrivalDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      },
    ]);

    // Seed leads
    await db.insert(leads).values([
      {
        leadNumber: "LD-1001",
        customerName: "Anil Kapoor",
        phone: "9876543300",
        email: "anil@example.com",
        source: "walk_in",
        interestedModel: "ZForce X1",
        status: "hot",
        dealerId: dealer.id,
      },
      {
        leadNumber: "LD-1002",
        customerName: "Sunita Verma",
        phone: "9876543301",
        source: "website",
        interestedModel: "ZForce City",
        status: "warm",
        dealerId: dealer.id,
      },
    ]);

    // Seed test rides
    await db.insert(testRides).values([
      {
        customerName: "Vikash Gupta",
        customerPhone: "9876543400",
        vehicleModel: "ZForce X1",
        scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        salesperson: "Rajesh Sales",
        status: "scheduled",
        dealerId: dealer.id,
      },
      {
        customerName: "Neha Sharma",
        customerPhone: "9876543401",
        vehicleModel: "ZForce X2 Pro",
        scheduledDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        salesperson: "Priya Sales",
        status: "completed",
        feedback: "Great acceleration and smooth ride",
        conversionStatus: "converted",
        dealerId: dealer.id,
      },
    ]);

    // Seed complaints
    await db.insert(complaints).values([
      {
        complaintNumber: "CMP-1001",
        customerName: "Rohit Saxena",
        customerPhone: "9876543500",
        vehicleNumber: "MH 12 XY 5678",
        category: "battery_problem",
        description: "Battery not charging beyond 80%",
        status: "open",
        escalationLevel: 1,
        dealerId: dealer.id,
      },
    ]);

    // Seed spare parts
    await db.insert(spares).values([
      {
        partNumber: "ZF-BAT-001",
        partName: "Lithium Battery Pack 48V",
        category: "battery",
        quantity: 15,
        minStock: 5,
        unitPrice: 45000,
        binLocation: "A-01-01",
        dealerId: dealer.id,
      },
      {
        partNumber: "ZF-MOT-001",
        partName: "Hub Motor 1000W",
        category: "motor",
        quantity: 8,
        minStock: 3,
        unitPrice: 12000,
        binLocation: "B-02-03",
        dealerId: dealer.id,
      },
      {
        partNumber: "ZF-CHG-001",
        partName: "Fast Charger 5A",
        category: "charger",
        quantity: 25,
        minStock: 10,
        unitPrice: 3500,
        binLocation: "C-01-05",
        dealerId: dealer.id,
      },
    ]);

    // Seed warranty claims
    await db.insert(warrantyClaims).values([
      {
        claimNumber: "WC-1001",
        vin: "ZF2024X1PRO001234",
        vehicleNumber: "MH 12 AB 1234",
        customerName: "Vikram Singh",
        claimType: "battery",
        description: "Battery capacity degraded below 70% within warranty period",
        claimAmount: 35000,
        status: "under_review",
        dealerId: dealer.id,
      },
    ]);

    // Seed battery health records
    await db.insert(batteryHealth).values([
      {
        vin: "ZF2024X1PRO001234",
        vehicleNumber: "MH 12 AB 1234",
        healthPercentage: 92,
        chargeCycles: 145,
        lastChecked: new Date(),
        dealerId: dealer.id,
      },
      {
        vin: "ZF2024X2MAX003456",
        vehicleNumber: "MH 01 CD 5678",
        healthPercentage: 68,
        chargeCycles: 520,
        lastChecked: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        dealerId: dealer.id,
      },
    ]);
  }
}

export const storage = new DatabaseStorage();
