import { 
  type User, type InsertUser,
  type Booking, type InsertBooking,
  type JobCard, type InsertJobCard,
  type Inventory, type InsertInventory,
  type Dealer, type InsertDealer,
  type DashboardStats, type SalesTrend, type ServiceMetrics
} from "@shared/schema";
import { randomUUID } from "crypto";

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
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private bookings: Map<string, Booking>;
  private jobCards: Map<string, JobCard>;
  private inventory: Map<string, Inventory>;
  private dealers: Map<string, Dealer>;
  private bookingCounter: number;
  private jobCardCounter: number;

  constructor() {
    this.users = new Map();
    this.bookings = new Map();
    this.jobCards = new Map();
    this.inventory = new Map();
    this.dealers = new Map();
    this.bookingCounter = 1000;
    this.jobCardCounter = 5000;
    
    this.seedData();
  }

  private seedData() {
    const dealer: Dealer = {
      id: "dealer-1",
      name: "ZForce Mumbai Central",
      code: "ZF-MUM-001",
      location: "Mumbai",
      region: "West",
      status: "active",
      contactPerson: "John Dealer",
      phone: "9876543210",
      email: "mumbai@zforce.com",
    };
    this.dealers.set(dealer.id, dealer);

    const sampleBookings: Booking[] = [
      {
        id: "b1",
        bookingNumber: "BK-1001",
        customerName: "Rahul Sharma",
        customerPhone: "9876543210",
        customerEmail: "rahul@example.com",
        vehicleModel: "ZForce X1",
        variant: "Pro",
        color: "Pearl White",
        bookingAmount: 15000,
        status: "confirmed",
        dealerId: "dealer-1",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        expectedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        vin: "ZF2024X1PRO001234",
        kycStatus: "approved",
      },
      {
        id: "b2",
        bookingNumber: "BK-1002",
        customerName: "Priya Patel",
        customerPhone: "9876543211",
        customerEmail: "priya@example.com",
        vehicleModel: "ZForce X2 Pro",
        variant: "Max",
        color: "Midnight Black",
        bookingAmount: 20000,
        status: "pending",
        dealerId: "dealer-1",
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        expectedDelivery: null,
        vin: null,
        kycStatus: "pending",
      },
      {
        id: "b3",
        bookingNumber: "BK-1003",
        customerName: "Amit Kumar",
        customerPhone: "9876543212",
        customerEmail: null,
        vehicleModel: "ZForce City",
        variant: "Base",
        color: "Ocean Blue",
        bookingAmount: 10000,
        status: "confirmed",
        dealerId: "dealer-1",
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        expectedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        vin: "ZF2024CITYBASE5678",
        kycStatus: "approved",
      },
      {
        id: "b4",
        bookingNumber: "BK-1004",
        customerName: "Sneha Reddy",
        customerPhone: "9876543213",
        customerEmail: "sneha@example.com",
        vehicleModel: "ZForce X1",
        variant: "Plus",
        color: "Lunar Silver",
        bookingAmount: 12000,
        status: "delivered",
        dealerId: "dealer-1",
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        expectedDelivery: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        vin: "ZF2024X1PLUS9012",
        kycStatus: "approved",
      },
    ];

    sampleBookings.forEach((b) => this.bookings.set(b.id, b));
    this.bookingCounter = 1005;

    const sampleJobCards: JobCard[] = [
      {
        id: "jc1",
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
        dealerId: "dealer-1",
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        estimatedCompletion: new Date(Date.now() + 4 * 60 * 60 * 1000),
        completedAt: null,
        laborCost: null,
        partsCost: null,
        priority: "normal",
      },
      {
        id: "jc2",
        jobNumber: "JC-5002",
        vehicleNumber: "MH 01 CD 5678",
        vin: "ZF2024X2MAX003456",
        customerName: "Meera Joshi",
        customerPhone: "9876543221",
        serviceType: "battery_check",
        complaints: "Battery draining faster than expected",
        status: "open",
        technicianId: null,
        technicianName: null,
        dealerId: "dealer-1",
        createdAt: new Date(),
        estimatedCompletion: null,
        completedAt: null,
        laborCost: null,
        partsCost: null,
        priority: "high",
      },
      {
        id: "jc3",
        jobNumber: "JC-5003",
        vehicleNumber: "MH 04 EF 9012",
        vin: "ZF2024CITYBASE7890",
        customerName: "Arjun Nair",
        customerPhone: "9876543222",
        serviceType: "electrical",
        complaints: "Dashboard display flickering intermittently",
        status: "open",
        technicianId: null,
        technicianName: null,
        dealerId: "dealer-1",
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        estimatedCompletion: null,
        completedAt: null,
        laborCost: null,
        partsCost: null,
        priority: "normal",
      },
      {
        id: "jc4",
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
        dealerId: "dealer-1",
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        estimatedCompletion: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        laborCost: 1500,
        partsCost: 3500,
        priority: "low",
      },
    ];

    sampleJobCards.forEach((jc) => this.jobCards.set(jc.id, jc));
    this.jobCardCounter = 5005;

    const sampleInventory: Inventory[] = [
      {
        id: "inv1",
        vin: "ZF2024X1PRO001234",
        model: "ZForce X1",
        variant: "Pro",
        color: "Pearl White",
        status: "allocated",
        dealerId: "dealer-1",
        arrivalDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        allocatedTo: "b1",
      },
      {
        id: "inv2",
        vin: "ZF2024X2MAX002345",
        model: "ZForce X2 Pro",
        variant: "Max",
        color: "Midnight Black",
        status: "in_stock",
        dealerId: "dealer-1",
        arrivalDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        allocatedTo: null,
      },
      {
        id: "inv3",
        vin: "ZF2024CITYBASE3456",
        model: "ZForce City",
        variant: "Base",
        color: "Ocean Blue",
        status: "in_transit",
        dealerId: "dealer-1",
        arrivalDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        allocatedTo: null,
      },
      {
        id: "inv4",
        vin: "ZF2024X1PLUS4567",
        model: "ZForce X1",
        variant: "Plus",
        color: "Lunar Silver",
        status: "in_stock",
        dealerId: "dealer-1",
        arrivalDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        allocatedTo: null,
      },
      {
        id: "inv5",
        vin: "ZF2024CARGO5678",
        model: "ZForce Cargo",
        variant: "Pro",
        color: "Pearl White",
        status: "in_transit",
        dealerId: "dealer-1",
        arrivalDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        allocatedTo: null,
      },
    ];

    sampleInventory.forEach((inv) => this.inventory.set(inv.id, inv));
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      id,
      username: insertUser.username,
      password: insertUser.password,
      role: insertUser.role || "dealer",
      name: insertUser.name,
      email: insertUser.email || null,
      dealerId: insertUser.dealerId || null,
    };
    this.users.set(id, user);
    return user;
  }

  async getBookings(): Promise<Booking[]> {
    return Array.from(this.bookings.values()).sort(
      (a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  }

  async getBooking(id: string): Promise<Booking | undefined> {
    return this.bookings.get(id);
  }

  async getRecentBookings(limit: number): Promise<Booking[]> {
    const all = await this.getBookings();
    return all.slice(0, limit);
  }

  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const id = randomUUID();
    this.bookingCounter++;
    const booking: Booking = {
      id,
      bookingNumber: `BK-${this.bookingCounter}`,
      customerName: insertBooking.customerName,
      customerPhone: insertBooking.customerPhone,
      customerEmail: insertBooking.customerEmail || null,
      vehicleModel: insertBooking.vehicleModel,
      variant: insertBooking.variant,
      color: insertBooking.color,
      bookingAmount: insertBooking.bookingAmount,
      status: insertBooking.status || "pending",
      dealerId: insertBooking.dealerId,
      createdAt: new Date(),
      expectedDelivery: insertBooking.expectedDelivery || null,
      vin: insertBooking.vin || null,
      kycStatus: insertBooking.kycStatus || "pending",
    };
    this.bookings.set(id, booking);
    return booking;
  }

  async updateBooking(id: string, updates: Partial<InsertBooking>): Promise<Booking | undefined> {
    const booking = this.bookings.get(id);
    if (!booking) return undefined;
    
    const updated = { ...booking, ...updates };
    this.bookings.set(id, updated);
    return updated;
  }

  async deleteBooking(id: string): Promise<boolean> {
    return this.bookings.delete(id);
  }

  async getJobCards(): Promise<JobCard[]> {
    return Array.from(this.jobCards.values()).sort(
      (a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  }

  async getJobCard(id: string): Promise<JobCard | undefined> {
    return this.jobCards.get(id);
  }

  async getActiveJobCards(): Promise<JobCard[]> {
    return Array.from(this.jobCards.values())
      .filter((jc) => jc.status === "open" || jc.status === "in_progress")
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async createJobCard(insertJobCard: InsertJobCard): Promise<JobCard> {
    const id = randomUUID();
    this.jobCardCounter++;
    const jobCard: JobCard = {
      id,
      jobNumber: `JC-${this.jobCardCounter}`,
      vehicleNumber: insertJobCard.vehicleNumber,
      vin: insertJobCard.vin,
      customerName: insertJobCard.customerName,
      customerPhone: insertJobCard.customerPhone,
      serviceType: insertJobCard.serviceType,
      complaints: insertJobCard.complaints,
      status: insertJobCard.status || "open",
      technicianId: insertJobCard.technicianId || null,
      technicianName: insertJobCard.technicianName || null,
      dealerId: insertJobCard.dealerId,
      createdAt: new Date(),
      estimatedCompletion: insertJobCard.estimatedCompletion || null,
      completedAt: insertJobCard.completedAt || null,
      laborCost: insertJobCard.laborCost || null,
      partsCost: insertJobCard.partsCost || null,
      priority: insertJobCard.priority || "normal",
    };
    this.jobCards.set(id, jobCard);
    return jobCard;
  }

  async updateJobCard(id: string, updates: Partial<InsertJobCard>): Promise<JobCard | undefined> {
    const jobCard = this.jobCards.get(id);
    if (!jobCard) return undefined;
    
    const updated = { ...jobCard, ...updates };
    this.jobCards.set(id, updated);
    return updated;
  }

  async deleteJobCard(id: string): Promise<boolean> {
    return this.jobCards.delete(id);
  }

  async getInventory(): Promise<Inventory[]> {
    return Array.from(this.inventory.values());
  }

  async getInventoryByStatus(status: string): Promise<Inventory[]> {
    return Array.from(this.inventory.values()).filter((inv) => inv.status === status);
  }

  async createInventory(insertInventory: InsertInventory): Promise<Inventory> {
    const id = randomUUID();
    const inventory: Inventory = {
      id,
      vin: insertInventory.vin,
      model: insertInventory.model,
      variant: insertInventory.variant,
      color: insertInventory.color,
      status: insertInventory.status || "in_transit",
      dealerId: insertInventory.dealerId || null,
      arrivalDate: insertInventory.arrivalDate || null,
      allocatedTo: insertInventory.allocatedTo || null,
    };
    this.inventory.set(id, inventory);
    return inventory;
  }

  async updateInventory(id: string, updates: Partial<InsertInventory>): Promise<Inventory | undefined> {
    const inventory = this.inventory.get(id);
    if (!inventory) return undefined;
    
    const updated = { ...inventory, ...updates };
    this.inventory.set(id, updated);
    return updated;
  }

  async getDealers(): Promise<Dealer[]> {
    return Array.from(this.dealers.values());
  }

  async getDealer(id: string): Promise<Dealer | undefined> {
    return this.dealers.get(id);
  }

  async createDealer(insertDealer: InsertDealer): Promise<Dealer> {
    const id = randomUUID();
    const dealer: Dealer = {
      id,
      name: insertDealer.name,
      code: insertDealer.code,
      location: insertDealer.location,
      region: insertDealer.region,
      status: insertDealer.status || "active",
      contactPerson: insertDealer.contactPerson || null,
      phone: insertDealer.phone || null,
      email: insertDealer.email || null,
    };
    this.dealers.set(id, dealer);
    return dealer;
  }

  async getDashboardStats(): Promise<DashboardStats> {
    const bookings = Array.from(this.bookings.values());
    const jobCards = Array.from(this.jobCards.values());
    
    const totalBookings = bookings.length;
    const pendingDeliveries = bookings.filter((b) => b.status === "confirmed").length;
    const activeJobCards = jobCards.filter((jc) => jc.status === "open" || jc.status === "in_progress").length;
    
    const monthlyRevenue = bookings
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
}

export const storage = new MemStorage();
