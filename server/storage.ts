import { 
  type Customer, 
  type InsertCustomer, 
  type UpdateCustomer,
  type Order, 
  type InsertOrder, 
  type UpdateOrder,
  type OrderWithCustomer,
  type CustomerWithOrderCount,
  type OrderStatus 
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Customer operations
  getCustomer(id: string): Promise<Customer | undefined>;
  getAllCustomers(): Promise<CustomerWithOrderCount[]>;
  searchCustomers(searchTerm: string): Promise<CustomerWithOrderCount[]>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: string, customer: UpdateCustomer): Promise<Customer | undefined>;
  deleteCustomer(id: string): Promise<boolean>;

  // Order operations
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

  // Analytics
  getTotalRevenue(startDate?: Date, endDate?: Date): Promise<number>;
  getOrderMetrics(): Promise<{
    totalOrders: number;
    totalRevenue: number;
    upcomingOrders: number;
    totalCustomers: number;
  }>;
}

export class MemStorage implements IStorage {
  private customers: Map<string, Customer>;
  private orders: Map<string, Order>;

  constructor() {
    this.customers = new Map();
    this.orders = new Map();
  }

  // Customer operations
  async getCustomer(id: string): Promise<Customer | undefined> {
    return this.customers.get(id);
  }

  async getAllCustomers(): Promise<CustomerWithOrderCount[]> {
    const customers = Array.from(this.customers.values());
    return customers.map(customer => ({
      ...customer,
      totalOrders: this.getCustomerOrderCount(customer.id)
    }));
  }

  async searchCustomers(searchTerm: string): Promise<CustomerWithOrderCount[]> {
    const allCustomers = await this.getAllCustomers();
    const term = searchTerm.toLowerCase();
    return allCustomers.filter(customer =>
      customer.name.toLowerCase().includes(term) ||
      customer.phone.includes(term) ||
      customer.email?.toLowerCase().includes(term) ||
      customer.id.includes(term)
    );
  }

  async createCustomer(insertCustomer: InsertCustomer): Promise<Customer> {
    const id = randomUUID();
    const customer: Customer = {
      ...insertCustomer,
      id,
      email: insertCustomer.email || null,
      address: insertCustomer.address || null,
      createdAt: new Date(),
    };
    this.customers.set(id, customer);
    return customer;
  }

  async updateCustomer(id: string, updateCustomer: UpdateCustomer): Promise<Customer | undefined> {
    const existing = this.customers.get(id);
    if (!existing) return undefined;

    const updated: Customer = {
      ...existing,
      ...updateCustomer,
    };
    this.customers.set(id, updated);
    return updated;
  }

  async deleteCustomer(id: string): Promise<boolean> {
    // Check if customer has orders
    const customerOrders = Array.from(this.orders.values()).filter(
      order => order.customerId === id
    );
    if (customerOrders.length > 0) {
      return false; // Cannot delete customer with existing orders
    }
    return this.customers.delete(id);
  }

  // Order operations
  async getOrder(id: string): Promise<OrderWithCustomer | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;

    const customer = this.customers.get(order.customerId);
    if (!customer) return undefined;

    return { ...order, customer };
  }

  async getAllOrders(): Promise<OrderWithCustomer[]> {
    const orders = Array.from(this.orders.values());
    const ordersWithCustomers: OrderWithCustomer[] = [];

    for (const order of orders) {
      const customer = this.customers.get(order.customerId);
      if (customer) {
        ordersWithCustomers.push({ ...order, customer });
      }
    }

    return ordersWithCustomers.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getOrdersByCustomerId(customerId: string): Promise<OrderWithCustomer[]> {
    const allOrders = await this.getAllOrders();
    return allOrders.filter(order => order.customerId === customerId);
  }

  async getOrdersByStatus(status: OrderStatus): Promise<OrderWithCustomer[]> {
    const allOrders = await this.getAllOrders();
    return allOrders.filter(order => order.status === status);
  }

  async getOrdersByDateRange(startDate: Date, endDate: Date): Promise<OrderWithCustomer[]> {
    const allOrders = await this.getAllOrders();
    return allOrders.filter(order => {
      const orderDate = new Date(order.orderDate);
      return orderDate >= startDate && orderDate <= endDate;
    });
  }

  async getUpcomingOrders(days: number = 7): Promise<OrderWithCustomer[]> {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + days);

    const allOrders = await this.getAllOrders();
    return allOrders.filter(order => {
      const deliveryDate = new Date(order.deliveryDate);
      return deliveryDate >= today && deliveryDate <= futureDate && order.status === "Pending";
    }).sort((a, b) => 
      new Date(a.deliveryDate).getTime() - new Date(b.deliveryDate).getTime()
    );
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = randomUUID();
    const now = new Date();
    const order: Order = {
      ...insertOrder,
      id,
      cakeImage: insertOrder.cakeImage || null,
      writingOnCake: insertOrder.writingOnCake || null,
      notes: insertOrder.notes || null,
      price: insertOrder.price.toString(),
      createdAt: now,
      updatedAt: now,
    };
    this.orders.set(id, order);
    return order;
  }

  async updateOrder(id: string, updateOrder: UpdateOrder): Promise<Order | undefined> {
    const existing = this.orders.get(id);
    if (!existing) return undefined;

    // Create clean update object without conflicting fields
    const { price, cakeImage, writingOnCake, notes, ...otherUpdates } = updateOrder;
    
    const updated: Order = {
      ...existing,
      ...otherUpdates,
      ...(price !== undefined && { price: price.toString() }),
      ...(cakeImage !== undefined && { cakeImage: cakeImage || null }),
      ...(writingOnCake !== undefined && { writingOnCake: writingOnCake || null }),
      ...(notes !== undefined && { notes: notes || null }),
      updatedAt: new Date(),
    };
    this.orders.set(id, updated);
    return updated;
  }

  async updateOrderStatus(id: string, status: OrderStatus): Promise<Order | undefined> {
    return this.updateOrder(id, { status });
  }

  async deleteOrder(id: string): Promise<boolean> {
    return this.orders.delete(id);
  }

  // Analytics
  async getTotalRevenue(startDate?: Date, endDate?: Date): Promise<number> {
    let orders = Array.from(this.orders.values());
    
    if (startDate && endDate) {
      orders = orders.filter(order => {
        const orderDate = new Date(order.orderDate);
        return orderDate >= startDate && orderDate <= endDate;
      });
    }

    return orders
      .filter(order => order.status === "Completed")
      .reduce((total, order) => total + parseFloat(order.price), 0);
  }

  async getOrderMetrics(): Promise<{
    totalOrders: number;
    totalRevenue: number;
    upcomingOrders: number;
    totalCustomers: number;
  }> {
    const totalOrders = this.orders.size;
    const totalRevenue = await this.getTotalRevenue();
    const upcomingOrders = (await this.getUpcomingOrders()).length;
    const totalCustomers = this.customers.size;

    return {
      totalOrders,
      totalRevenue,
      upcomingOrders,
      totalCustomers,
    };
  }

  // Helper methods
  private getCustomerOrderCount(customerId: string): number {
    return Array.from(this.orders.values()).filter(
      order => order.customerId === customerId
    ).length;
  }
}

export const storage = new MemStorage();
