// import { sql } from "drizzle-orm";
// import { pgTable, text, varchar, decimal, timestamp, uuid } from "drizzle-orm/pg-core";
// import { createInsertSchema } from "drizzle-zod";
// import { z } from "zod";

// // Customers table
// export const customers = pgTable("customers", {
//   id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
//   name: text("name").notNull(),
//   phone: text("phone").notNull(),
//   email: text("email"),
//   address: text("address"),
//   createdAt: timestamp("created_at").defaultNow().notNull(),
// });

// // Orders table
// export const orders = pgTable("orders", {
//   id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
//   customerId: uuid("customer_id").references(() => customers.id).notNull(),
//   cakeImage: text("cake_image"), // URL to uploaded image
//   writingOnCake: text("writing_on_cake"),
//   orderDate: timestamp("order_date").notNull(),
//   deliveryDate: timestamp("delivery_date").notNull(),
//   price: decimal("price", { precision: 10, scale: 2 }).notNull(),
//   status: text("status", { enum: ["Pending", "Completed", "Cancelled"] }).notNull().default("Pending"),
//   notes: text("notes"),
//   createdAt: timestamp("created_at").defaultNow().notNull(),
//   updatedAt: timestamp("updated_at").defaultNow().notNull(),
// });

// // Schema for inserting customers
// export const insertCustomerSchema = createInsertSchema(customers).omit({
//   id: true,
//   createdAt: true,
// }).extend({
//   name: z.string().min(1, "Name is required"),
//   phone: z.string().min(1, "Phone number is required"),
//   email: z.string().email("Invalid email").optional().or(z.literal("")),
//   address: z.string().optional(),
// });

// // Schema for inserting orders
// export const insertOrderSchema = createInsertSchema(orders).omit({
//   id: true,
//   createdAt: true,
//   updatedAt: true,
// }).extend({
//   customerId: z.string().uuid("Invalid customer ID"),
//   cakeImage: z.string().optional(),
//   writingOnCake: z.string().optional(),
//   orderDate: z.date(),
//   deliveryDate: z.date(),
//   price: z.number().positive("Price must be positive"),
//   status: z.enum(["Pending", "Completed", "Cancelled"]),
//   notes: z.string().optional(),
// });

// // Update schemas
// export const updateCustomerSchema = insertCustomerSchema.partial();
// export const updateOrderSchema = insertOrderSchema.partial();

// // Types
// export type Customer = typeof customers.$inferSelect;
// export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
// export type UpdateCustomer = z.infer<typeof updateCustomerSchema>;

// export type Order = typeof orders.$inferSelect;
// export type InsertOrder = z.infer<typeof insertOrderSchema>;
// export type UpdateOrder = z.infer<typeof updateOrderSchema>;

// export type OrderStatus = "Pending" | "Completed" | "Cancelled";

// // Join types for queries
// export type OrderWithCustomer = Order & {
//   customer: Customer;
// };

// export type CustomerWithOrderCount = Customer & {
//   totalOrders: number;
// };



import { sql } from "drizzle-orm";
import { pgTable, text, timestamp, uuid, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Customers table
export const customers = pgTable("customers", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  address: text("address"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Orders table
export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: uuid("customer_id").references(() => customers.id).notNull(),
  cakeImage: text("cake_image"),
  writingOnCake: text("writing_on_cake"),
  orderDate: timestamp("order_date").notNull(),
  deliveryDate: timestamp("delivery_date").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  status: text("status", { enum: ["Pending", "Completed", "Cancelled"] }).notNull().default("Pending"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Insert schemas
export const insertCustomerSchema = createInsertSchema(customers)
  .omit({ id: true, createdAt: true })
  .extend({
    name: z.string().min(1),
    phone: z.string().min(1),
    email: z.string().email().optional().or(z.literal("")),
    address: z.string().optional(),
  });

export const insertOrderSchema = createInsertSchema(orders)
  .omit({ id: true, createdAt: true, updatedAt: true })
  .extend({
    customerId: z.string().uuid(),
    cakeImage: z.string().optional(),
    writingOnCake: z.string().optional(),
    orderDate: z.date(),
    deliveryDate: z.date(),
    price: z.number().positive(),
    status: z.enum(["Pending", "Completed", "Cancelled"]),
    notes: z.string().optional(),
  });

// Update schemas
export const updateCustomerSchema = insertCustomerSchema.partial();
export const updateOrderSchema = insertOrderSchema.partial();

// Types
export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type UpdateCustomer = z.infer<typeof updateCustomerSchema>;

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type UpdateOrder = z.infer<typeof updateOrderSchema>;

export type OrderStatus = "Pending" | "Completed" | "Cancelled";

// Join types
export type OrderWithCustomer = Order & { customer: Customer };
export type CustomerWithOrderCount = Customer & { totalOrders: number };
