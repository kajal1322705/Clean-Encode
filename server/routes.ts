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

  return httpServer;
}
