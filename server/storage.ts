import { 
  type User, type InsertUser,
  type Booking, type InsertBooking,
  type JobCard, type InsertJobCard,
  type Inventory, type InsertInventory,
  type Dealer, type InsertDealer,
  type DashboardStats, type SalesTrend, type ServiceMetrics,
  users, bookings, jobCards, inventory, dealers
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
  }
}

export const storage = new DatabaseStorage();
