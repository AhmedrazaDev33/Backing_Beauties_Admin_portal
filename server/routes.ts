import type { Express, Request, Response } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertOrderSchema, updateOrderSchema, insertCustomerSchema, updateCustomerSchema } from "@shared/schema";
import { z } from "zod";
import multer, { type FileFilterCallback } from "multer";
import path from "path";
import { promises as fs } from "fs";

// Configure multer for image uploads
const uploadDir = path.join(process.cwd(), "uploads");
const upload = multer({
  dest: uploadDir,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Ensure uploads directory exists
async function ensureUploadsDir() {
  try {
    await fs.access(uploadDir);
  } catch {
    await fs.mkdir(uploadDir, { recursive: true });
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  await ensureUploadsDir();

  // Serve uploaded images
  app.use('/api/uploads', express.static(uploadDir));

  // Orders routes
  
  // GET /api/orders - Get all orders with optional filtering
  app.get("/api/orders", async (req, res) => {
    try {
      const { status, customer_id, start_date, end_date, upcoming_days } = req.query;
      
      let orders;
      
      if (upcoming_days) {
        orders = await storage.getUpcomingOrders(parseInt(upcoming_days as string));
      } else if (start_date && end_date) {
        orders = await storage.getOrdersByDateRange(
          new Date(start_date as string),
          new Date(end_date as string)
        );
      } else if (status) {
        orders = await storage.getOrdersByStatus(status as any);
      } else if (customer_id) {
        orders = await storage.getOrdersByCustomerId(customer_id as string);
      } else {
        orders = await storage.getAllOrders();
      }
      
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  // GET /api/orders/:id - Get specific order
  app.get("/api/orders/:id", async (req, res) => {
    try {
      const order = await storage.getOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({ error: "Failed to fetch order" });
    }
  });

  // POST /api/orders - Create new order
  app.post("/api/orders", async (req, res) => {
    try {
      // Parse dates from string format
      const orderData = {
        ...req.body,
        orderDate: new Date(req.body.orderDate),
        deliveryDate: new Date(req.body.deliveryDate),
        price: parseFloat(req.body.price)
      };

      const validatedOrder = insertOrderSchema.parse(orderData);
      const order = await storage.createOrder(validatedOrder);
      res.status(201).json(order);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      console.error("Error creating order:", error);
      res.status(500).json({ error: "Failed to create order" });
    }
  });

  // PUT /api/orders/:id - Update order
  app.put("/api/orders/:id", async (req, res) => {
    try {
      const updateData = { ...req.body };
      
      // Parse dates if provided
      if (updateData.orderDate) {
        updateData.orderDate = new Date(updateData.orderDate);
      }
      if (updateData.deliveryDate) {
        updateData.deliveryDate = new Date(updateData.deliveryDate);
      }
      if (updateData.price) {
        updateData.price = parseFloat(updateData.price);
      }

      const validatedUpdate = updateOrderSchema.parse(updateData);
      const order = await storage.updateOrder(req.params.id, validatedUpdate);
      
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      
      res.json(order);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      console.error("Error updating order:", error);
      res.status(500).json({ error: "Failed to update order" });
    }
  });

  // PATCH /api/orders/:id/status - Update order status
  app.patch("/api/orders/:id/status", async (req, res) => {
    try {
      const { status } = req.body;
      if (!status || !["Pending", "Completed", "Cancelled"].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }

      const order = await storage.updateOrderStatus(req.params.id, status);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      
      res.json(order);
    } catch (error) {
      console.error("Error updating order status:", error);
      res.status(500).json({ error: "Failed to update order status" });
    }
  });

  // DELETE /api/orders/:id - Delete order
  app.delete("/api/orders/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteOrder(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Order not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting order:", error);
      res.status(500).json({ error: "Failed to delete order" });
    }
  });

  // POST /api/orders/upload-image - Upload cake image
  app.post("/api/orders/upload-image", upload.single('image'), async (req: Request, res: Response) => {
    try {
      const file = req.file as Express.Multer.File | undefined;
      if (!file) {
        return res.status(400).json({ error: "No image file provided" });
      }

      // Generate unique filename
      const fileExtension = path.extname(file.originalname);
      const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}${fileExtension}`;
      const newPath = path.join(uploadDir, filename);

      // Move file to permanent location
      await fs.rename(file.path, newPath);

      const imageUrl = `/api/uploads/${filename}`;
      res.json({ imageUrl });
    } catch (error) {
      console.error("Error uploading image:", error);
      res.status(500).json({ error: "Failed to upload image" });
    }
  });

  // Customers routes

  // GET /api/customers - Get all customers with search
  app.get("/api/customers", async (req, res) => {
    try {
      const { search } = req.query;
      
      let customers;
      if (search) {
        customers = await storage.searchCustomers(search as string);
      } else {
        customers = await storage.getAllCustomers();
      }
      
      res.json(customers);
    } catch (error) {
      console.error("Error fetching customers:", error);
      res.status(500).json({ error: "Failed to fetch customers" });
    }
  });

  // GET /api/customers/:id - Get specific customer
  app.get("/api/customers/:id", async (req, res) => {
    try {
      const customer = await storage.getCustomer(req.params.id);
      if (!customer) {
        return res.status(404).json({ error: "Customer not found" });
      }
      res.json(customer);
    } catch (error) {
      console.error("Error fetching customer:", error);
      res.status(500).json({ error: "Failed to fetch customer" });
    }
  });

  // GET /api/customers/:id/orders - Get customer's orders
  app.get("/api/customers/:id/orders", async (req, res) => {
    try {
      const orders = await storage.getOrdersByCustomerId(req.params.id);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching customer orders:", error);
      res.status(500).json({ error: "Failed to fetch customer orders" });
    }
  });

  // POST /api/customers - Create new customer
  app.post("/api/customers", async (req, res) => {
    try {
      const validatedCustomer = insertCustomerSchema.parse(req.body);
      const customer = await storage.createCustomer(validatedCustomer);
      res.status(201).json(customer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      console.error("Error creating customer:", error);
      res.status(500).json({ error: "Failed to create customer" });
    }
  });

  // PUT /api/customers/:id - Update customer
  app.put("/api/customers/:id", async (req, res) => {
    try {
      const validatedUpdate = updateCustomerSchema.parse(req.body);
      const customer = await storage.updateCustomer(req.params.id, validatedUpdate);
      
      if (!customer) {
        return res.status(404).json({ error: "Customer not found" });
      }
      
      res.json(customer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      console.error("Error updating customer:", error);
      res.status(500).json({ error: "Failed to update customer" });
    }
  });

  // DELETE /api/customers/:id - Delete customer
  app.delete("/api/customers/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteCustomer(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Customer not found or has existing orders" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting customer:", error);
      res.status(500).json({ error: "Failed to delete customer" });
    }
  });

  // Analytics routes

  // GET /api/analytics/metrics - Get dashboard metrics
  app.get("/api/analytics/metrics", async (req, res) => {
    try {
      const metrics = await storage.getOrderMetrics();
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching metrics:", error);
      res.status(500).json({ error: "Failed to fetch metrics" });
    }
  });

  // GET /api/analytics/revenue - Get revenue data
  app.get("/api/analytics/revenue", async (req, res) => {
    try {
      const { start_date, end_date } = req.query;
      
      let revenue;
      if (start_date && end_date) {
        revenue = await storage.getTotalRevenue(
          new Date(start_date as string),
          new Date(end_date as string)
        );
      } else {
        revenue = await storage.getTotalRevenue();
      }
      
      res.json({ revenue });
    } catch (error) {
      console.error("Error fetching revenue:", error);
      res.status(500).json({ error: "Failed to fetch revenue" });
    }
  });

  // GET /api/analytics/upcoming-reminders - Get orders due soon
  app.get("/api/analytics/upcoming-reminders", async (req, res) => {
    try {
      const { days = 1 } = req.query;
      const upcomingOrders = await storage.getUpcomingOrders(parseInt(days as string));
      
      // Transform orders for reminder format
      const reminders = upcomingOrders.map(order => ({
        id: order.id,
        customerName: order.customer.name,
        deliveryDate: order.deliveryDate.toLocaleDateString(),
        daysTillDelivery: Math.ceil(
          (new Date(order.deliveryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        )
      }));
      
      res.json(reminders);
    } catch (error) {
      console.error("Error fetching upcoming reminders:", error);
      res.status(500).json({ error: "Failed to fetch upcoming reminders" });
    }
  });

  // Seed data endpoint for testing
  app.post("/api/seed", async (req, res) => {
    try {
      console.log('🌱 Seeding test data...');

      // Create test customers
      const customers = [
        {
          name: "Sarah Johnson",
          phone: "+1 (555) 123-4567", 
          email: "sarah.johnson@email.com",
          address: "123 Oak Street, Downtown, NY 10001"
        },
        {
          name: "Mike Wilson",
          phone: "+1 (555) 234-5678",
          email: "mike.wilson@email.com", 
          address: "456 Pine Avenue, Midtown, NY 10002"
        },
        {
          name: "Emma Thompson", 
          phone: "+1 (555) 345-6789",
          email: "emma.thompson@email.com",
          address: "789 Maple Drive, Uptown, NY 10003"
        },
        {
          name: "David Chen",
          phone: "+1 (555) 456-7890",
          email: "david.chen@email.com",
          address: "321 Birch Lane, Suburb, NY 10004"
        },
        {
          name: "Lisa Martinez",
          phone: "+1 (555) 567-8901", 
          email: "lisa.martinez@email.com",
          address: "654 Cedar Court, Downtown, NY 10005"
        }
      ];

      const createdCustomers = [];
      for (const customerData of customers) {
        const customer = await storage.createCustomer(customerData);
        createdCustomers.push(customer);
      }

      // Create test orders
      const orders = [
        {
          customerId: createdCustomers[0].id,
          cakeImage: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop",
          writingOnCake: "Happy Birthday Emma!",
          orderDate: "2024-01-15",
          deliveryDate: "2024-01-22", 
          price: "125.50",
          status: "Pending" as const,
          notes: "Customer wants pink and white roses decoration"
        },
        {
          customerId: createdCustomers[1].id,
          cakeImage: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=400&h=300&fit=crop",
          writingOnCake: "Congratulations!",
          orderDate: "2024-01-14",
          deliveryDate: "2024-01-21",
          price: "95.00", 
          status: "Completed" as const,
          notes: "Anniversary cake with gold accents"
        },
        {
          customerId: createdCustomers[2].id,
          cakeImage: "https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?w=400&h=300&fit=crop", 
          writingOnCake: "Happy Anniversary!",
          orderDate: "2024-01-12",
          deliveryDate: "2024-01-28",
          price: "180.00",
          status: "Pending" as const,
          notes: "Large 3-tier wedding anniversary cake"
        },
        {
          customerId: createdCustomers[3].id,
          orderDate: "2024-01-13",
          deliveryDate: "2024-01-19",
          price: "75.00",
          status: "Completed" as const,
          notes: "Simple birthday cake, no writing requested"
        },
        {
          customerId: createdCustomers[4].id,
          cakeImage: "https://images.unsplash.com/photo-1557925923-cd4648e8ac1d?w=400&h=300&fit=crop",
          writingOnCake: "Welcome Baby!",
          orderDate: "2024-01-16", 
          deliveryDate: "2024-01-30",
          price: "110.00",
          status: "Pending" as const,
          notes: "Baby shower cake with pastel colors"
        },
        {
          customerId: createdCustomers[0].id,
          cakeImage: "https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=400&h=300&fit=crop",
          writingOnCake: "Happy Retirement!",
          orderDate: "2024-01-10",
          deliveryDate: "2024-01-17",
          price: "65.00",
          status: "Completed" as const
        }
      ];

      const createdOrders = [];
      for (const orderData of orders) {
        const order = await storage.createOrder(orderData);
        createdOrders.push(order);
      }

      console.log(`✅ Created ${createdCustomers.length} customers and ${createdOrders.length} orders`);

      res.json({
        success: true,
        message: 'Seed data created successfully',
        customers: createdCustomers.length,
        orders: createdOrders.length
      });
    } catch (error) {
      console.error('❌ Seeding failed:', error);
      res.status(500).json({ error: 'Failed to seed data' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
