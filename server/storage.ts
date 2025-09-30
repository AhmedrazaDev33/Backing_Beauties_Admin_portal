// import { 
//   type Customer, 
//   type InsertCustomer, 
//   type UpdateCustomer,
//   type Order, 
//   type InsertOrder, 
//   type UpdateOrder,
//   type OrderWithCustomer,
//   type CustomerWithOrderCount,
//   type OrderStatus 
// } from "@shared/schema";
// import { randomUUID } from "crypto";

// export interface IStorage {
//   getCustomer(id: string): Promise<Customer | undefined>;
//   getAllCustomers(): Promise<CustomerWithOrderCount[]>;
//   searchCustomers(searchTerm: string): Promise<CustomerWithOrderCount[]>;
//   createCustomer(customer: InsertCustomer): Promise<Customer>;
//   updateCustomer(id: string, customer: UpdateCustomer): Promise<Customer | undefined>;
//   deleteCustomer(id: string): Promise<boolean>;

//   getOrder(id: string): Promise<OrderWithCustomer | undefined>;
//   getAllOrders(): Promise<OrderWithCustomer[]>;
//   getOrdersByCustomerId(customerId: string): Promise<OrderWithCustomer[]>;
//   getOrdersByStatus(status: OrderStatus): Promise<OrderWithCustomer[]>;
//   getOrdersByDateRange(startDate: Date, endDate: Date): Promise<OrderWithCustomer[]>;
//   getUpcomingOrders(days: number): Promise<OrderWithCustomer[]>;
//   createOrder(order: InsertOrder): Promise<Order>;
//   updateOrder(id: string, order: UpdateOrder): Promise<Order | undefined>;
//   updateOrderStatus(id: string, status: OrderStatus): Promise<Order | undefined>;
//   deleteOrder(id: string): Promise<boolean>;

//   getTotalRevenue(startDate?: Date, endDate?: Date): Promise<number>;
//   getOrderMetrics(): Promise<{
//     totalOrders: number;
//     totalRevenue: number;
//     upcomingOrders: number;
//     totalCustomers: number;
//   }>;
// }

// export class MemStorage implements IStorage {
//   private customers: Map<string, Customer>;
//   private orders: Map<string, Order>;

//   constructor() {
//     this.customers = new Map();
//     this.orders = new Map();
//   }

//   async getCustomer(id: string): Promise<Customer | undefined> {
//     return this.customers.get(id);
//   }

//   async getAllCustomers(): Promise<CustomerWithOrderCount[]> {
//     const customers = Array.from(this.customers.values());
//     return customers.map(customer => ({
//       ...customer,
//       totalOrders: this.getCustomerOrderCount(customer.id)
//     }));
//   }

//   async searchCustomers(searchTerm: string): Promise<CustomerWithOrderCount[]> {
//     const allCustomers = await this.getAllCustomers();
//     const term = searchTerm.toLowerCase();
//     return allCustomers.filter(customer =>
//       customer.name.toLowerCase().includes(term) ||
//       customer.phone.includes(term) ||
//       customer.email?.toLowerCase().includes(term) ||
//       customer.id.includes(term)
//     );
//   }

//   async createCustomer(insertCustomer: InsertCustomer): Promise<Customer> {
//     const id = randomUUID();
//     const customer: Customer = {
//       ...insertCustomer,
//       id,
//       email: insertCustomer.email || null,
//       address: insertCustomer.address || null,
//       createdAt: new Date(),
//     };
//     this.customers.set(id, customer);
//     return customer;
//   }

//   async updateCustomer(id: string, updateCustomer: UpdateCustomer): Promise<Customer | undefined> {
//     const existing = this.customers.get(id);
//     if (!existing) return undefined;

//     const updated: Customer = {
//       ...existing,
//       ...updateCustomer,
//     };
//     this.customers.set(id, updated);
//     return updated;
//   }

//   async deleteCustomer(id: string): Promise<boolean> {
//     // Check if customer has orders
//     const customerOrders = Array.from(this.orders.values()).filter(
//       order => order.customerId === id
//     );
//     if (customerOrders.length > 0) {
//       return false; // Cannot delete customer with existing orders
//     }
//     return this.customers.delete(id);
//   }

//   // Order operations
//   async getOrder(id: string): Promise<OrderWithCustomer | undefined> {
//     const order = this.orders.get(id);
//     if (!order) return undefined;

//     const customer = this.customers.get(order.customerId);
//     if (!customer) return undefined;

//     return { ...order, customer };
//   }

//   async getAllOrders(): Promise<OrderWithCustomer[]> {
//     const orders = Array.from(this.orders.values());
//     const ordersWithCustomers: OrderWithCustomer[] = [];

//     for (const order of orders) {
//       const customer = this.customers.get(order.customerId);
//       if (customer) {
//         ordersWithCustomers.push({ ...order, customer });
//       }
//     }

//     return ordersWithCustomers.sort((a, b) => 
//       new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
//     );
//   }

//   async getOrdersByCustomerId(customerId: string): Promise<OrderWithCustomer[]> {
//     const allOrders = await this.getAllOrders();
//     return allOrders.filter(order => order.customerId === customerId);
//   }

//   async getOrdersByStatus(status: OrderStatus): Promise<OrderWithCustomer[]> {
//     const allOrders = await this.getAllOrders();
//     return allOrders.filter(order => order.status === status);
//   }

//   async getOrdersByDateRange(startDate: Date, endDate: Date): Promise<OrderWithCustomer[]> {
//     const allOrders = await this.getAllOrders();
//     return allOrders.filter(order => {
//       const orderDate = new Date(order.orderDate);
//       return orderDate >= startDate && orderDate <= endDate;
//     });
//   }

//   async getUpcomingOrders(days: number = 7): Promise<OrderWithCustomer[]> {
//     const today = new Date();
//     const futureDate = new Date();
//     futureDate.setDate(today.getDate() + days);

//     const allOrders = await this.getAllOrders();
//     return allOrders.filter(order => {
//       const deliveryDate = new Date(order.deliveryDate);
//       return deliveryDate >= today && deliveryDate <= futureDate && order.status === "Pending";
//     }).sort((a, b) => 
//       new Date(a.deliveryDate).getTime() - new Date(b.deliveryDate).getTime()
//     );
//   }

//   async createOrder(insertOrder: InsertOrder): Promise<Order> {
//     const id = randomUUID();
//     const now = new Date();
//     const order: Order = {
//       ...insertOrder,
//       id,
//       cakeImage: insertOrder.cakeImage || null,
//       writingOnCake: insertOrder.writingOnCake || null,
//       notes: insertOrder.notes || null,
//       price: insertOrder.price.toString(),
//       createdAt: now,
//       updatedAt: now,
//     };
//     this.orders.set(id, order);
//     return order;
//   }

//   async updateOrder(id: string, updateOrder: UpdateOrder): Promise<Order | undefined> {
//     const existing = this.orders.get(id);
//     if (!existing) return undefined;

//     // Create clean update object without conflicting fields
//     const { price, cakeImage, writingOnCake, notes, ...otherUpdates } = updateOrder;
    
//     const updated: Order = {
//       ...existing,
//       ...otherUpdates,
//       ...(price !== undefined && { price: price.toString() }),
//       ...(cakeImage !== undefined && { cakeImage: cakeImage || null }),
//       ...(writingOnCake !== undefined && { writingOnCake: writingOnCake || null }),
//       ...(notes !== undefined && { notes: notes || null }),
//       updatedAt: new Date(),
//     };
//     this.orders.set(id, updated);
//     return updated;
//   }

//   async updateOrderStatus(id: string, status: OrderStatus): Promise<Order | undefined> {
//     return this.updateOrder(id, { status });
//   }

//   async deleteOrder(id: string): Promise<boolean> {
//     return this.orders.delete(id);
//   }

//   // Analytics
//   async getTotalRevenue(startDate?: Date, endDate?: Date): Promise<number> {
//     let orders = Array.from(this.orders.values());
    
//     if (startDate && endDate) {
//       orders = orders.filter(order => {
//         const orderDate = new Date(order.orderDate);
//         return orderDate >= startDate && orderDate <= endDate;
//       });
//     }

//     return orders
//       .filter(order => order.status === "Completed")
//       .reduce((total, order) => total + parseFloat(order.price), 0);
//   }

//   async getOrderMetrics(): Promise<{
//     totalOrders: number;
//     totalRevenue: number;
//     upcomingOrders: number;
//     totalCustomers: number;
//   }> {
//     const totalOrders = this.orders.size;
//     const totalRevenue = await this.getTotalRevenue();
//     const upcomingOrders = (await this.getUpcomingOrders()).length;
//     const totalCustomers = this.customers.size;

//     return {
//       totalOrders,
//       totalRevenue,
//       upcomingOrders,
//       totalCustomers,
//     };
//   }

//   // Helper methods
//   private getCustomerOrderCount(customerId: string): number {
//     return Array.from(this.orders.values()).filter(
//       order => order.customerId === customerId
//     ).length;
//   }
// }

// export const storage = new MemStorage();


import { db } from "./db";
import { eq, count, inArray, desc } from "drizzle-orm";
import {
  customers,
  orders,
  type Customer,
  type InsertCustomer,
  type UpdateCustomer,
  type Order,
  type InsertOrder,
  type UpdateOrder,
  type OrderStatus,
  type CustomerWithOrderCount,
  type OrderWithCustomer,
} from "../shared/schema";

export interface IStorage {
  getCustomer(id: string): Promise<Customer | undefined>;
  getAllCustomers(): Promise<CustomerWithOrderCount[]>;
  searchCustomers(searchTerm: string): Promise<CustomerWithOrderCount[]>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: string, customer: UpdateCustomer): Promise<Customer | undefined>;
  deleteCustomer(id: string): Promise<boolean>;

  getOrder(id: string): Promise<OrderWithCustomer | undefined>;
  getAllOrders(): Promise<OrderWithCustomer[]>;
  getOrdersByCustomerId(customerId: string): Promise<OrderWithCustomer[]>;
  getOrdersByStatus(status: OrderStatus): Promise<OrderWithCustomer[]>;
  getOrdersByDateRange(startDate: Date, endDate: Date): Promise<OrderWithCustomer[]>;
  getUpcomingOrders(days: number): Promise<OrderWithCustomer[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrder(id: string, order: UpdateOrder): Promise<Order | undefined>;
  updateOrderStatus(id: string, status: OrderStatus): Promise<Order | undefined>;
  deleteOrder(id: string): Promise<boolean>;

  getTotalRevenue(startDate?: Date, endDate?: Date): Promise<number>;
  getOrderMetrics(): Promise<{
    totalOrders: number;
    totalRevenue: number;
    upcomingOrders: number;
    totalCustomers: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // --- Customers ---
  async getCustomer(id: string): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.id, id));
    return customer ?? undefined;
  }

  async getAllCustomers(): Promise<CustomerWithOrderCount[]> {
    const allCustomers = await db.select().from(customers);
    const counts = await db
      .select({ customerId: orders.customerId, totalOrders: count() })
      .from(orders)
      .groupBy(orders.customerId);

    return allCustomers.map(c => {
      const count = counts.find(x => x.customerId === c.id)?.totalOrders ?? 0;
      return { ...c, totalOrders: Number(count) };
    });
  }

  async searchCustomers(searchTerm: string): Promise<CustomerWithOrderCount[]> {
    const allCustomers = await this.getAllCustomers();
    const term = searchTerm.toLowerCase();
    return allCustomers.filter(c =>
      c.name.toLowerCase().includes(term) ||
      (c.email?.toLowerCase().includes(term) ?? false) ||
      c.phone.includes(term) ||
      c.id.includes(term)
    );
  }

  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const [newCustomer] = await db.insert(customers)
      .values({ ...customer, email: customer.email || null, address: customer.address || null, createdAt: new Date() })
      .returning();
    return newCustomer;
  }

  async updateCustomer(id: string, customer: UpdateCustomer): Promise<Customer | undefined> {
    const [updated] = await db.update(customers).set(customer).where(eq(customers.id, id)).returning();
    return updated ?? undefined;
  }

  async deleteCustomer(id: string): Promise<boolean> {
    const hasOrders = await db.select().from(orders).where(eq(orders.customerId, id));
    if (hasOrders.length > 0) return false;
    const result = await db.delete(customers).where(eq(customers.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // --- Orders ---
  async getOrder(id: string): Promise<OrderWithCustomer | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    if (!order) return undefined;
    const customer = await this.getCustomer(order.customerId);
    if (!customer) return undefined;
    return { ...order, customer };
  }

  async getAllOrders(): Promise<OrderWithCustomer[]> {
    const allOrders = await db.select().from(orders).orderBy(desc(orders.createdAt));
    const customerIds = Array.from(new Set(allOrders.map(o => o.customerId)));
    const customersMap = Object.fromEntries(
      (await db.select().from(customers).where(inArray(customers.id, customerIds))).map(c => [c.id, c])
    );

    return allOrders.map(o => ({ ...o, customer: customersMap[o.customerId] })).filter(o => o.customer);
  }

  async getOrdersByCustomerId(customerId: string): Promise<OrderWithCustomer[]> {
    return (await this.getAllOrders()).filter(o => o.customerId === customerId);
  }

  async getOrdersByStatus(status: OrderStatus): Promise<OrderWithCustomer[]> {
    return (await this.getAllOrders()).filter(o => o.status === status);
  }

  async getOrdersByDateRange(startDate: Date, endDate: Date): Promise<OrderWithCustomer[]> {
    return (await this.getAllOrders()).filter(o => {
      const date = new Date(o.orderDate);
      return date >= startDate && date <= endDate;
    });
  }

  async getUpcomingOrders(days = 7): Promise<OrderWithCustomer[]> {
    const today = new Date();
    const future = new Date();
    future.setDate(today.getDate() + days);
    return (await this.getAllOrders())
      .filter(o => o.status === "Pending" && new Date(o.deliveryDate) >= today && new Date(o.deliveryDate) <= future)
      .sort((a, b) => new Date(a.deliveryDate).getTime() - new Date(b.deliveryDate).getTime());
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const now = new Date();
    const [newOrder] = await db.insert(orders).values({
      ...order,
      price: typeof order.price === "number" ? order.price.toString() : order.price,
      createdAt: now,
      updatedAt: now
    }).returning();
    return newOrder;
  }

  async updateOrder(id: string, order: UpdateOrder): Promise<Order | undefined> {
    // Ensure price is a string if present and never a number
    const updateData = {
      ...order,
      ...(order.price !== undefined
        ? { price: typeof order.price === "number" ? order.price.toString() : order.price }
        : {}),
      updatedAt: new Date(),
    };
    const [updated] = await db.update(orders).set(updateData).where(eq(orders.id, id)).returning();
    return updated ?? undefined;
  }

  async updateOrderStatus(id: string, status: OrderStatus): Promise<Order | undefined> {
    return this.updateOrder(id, { status });
  }

  async deleteOrder(id: string): Promise<boolean> {
    const result = await db.delete(orders).where(eq(orders.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // --- Analytics ---
  async getTotalRevenue(startDate?: Date, endDate?: Date): Promise<number> {
    let allOrders = await db.select().from(orders);
    if (startDate && endDate) {
      allOrders = allOrders.filter(o => {
        const d = new Date(o.orderDate);
        return d >= startDate && d <= endDate;
      });
    }
    return allOrders.filter(o => o.status === "Completed").reduce((sum, o) => sum + parseFloat(o.price), 0);
  }

  async getOrderMetrics(): Promise<{
    totalOrders: number;
    totalRevenue: number;
    upcomingOrders: number;
    totalCustomers: number;
  }> {
    const totalOrders = (await db.select().from(orders)).length;
    const totalRevenue = await this.getTotalRevenue();
    const upcomingOrders = (await this.getUpcomingOrders()).length;
    const totalCustomers = (await db.select().from(customers)).length;
    return { totalOrders, totalRevenue, upcomingOrders, totalCustomers };
  }
}

export const storage = new DatabaseStorage();
