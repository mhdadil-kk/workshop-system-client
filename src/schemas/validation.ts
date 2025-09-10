import { z } from 'zod';

// Service validation schema
export const serviceSchema = z.object({
  name: z.string().min(1, "Service name is required"),
  description: z.string().optional(),
  amount: z.number().min(0, "Amount must be positive")
});

// Customer validation schema (for creation)
export const createCustomerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format").optional().or(z.literal("")),
  mobile: z.string().min(10, "Mobile number must be at least 10 digits"),
  address: z.string().optional().or(z.literal(""))
});

// Vehicle validation schema (for creation)
export const createVehicleSchema = z.object({
  vehicleNumber: z.string().min(1, "Vehicle number is required"),
  make: z.string().min(1, "Make is required"),
  vehicleModel: z.string().min(1, "Model is required"),
  year: z.number().min(1900).max(new Date().getFullYear() + 1).optional(),
  color: z.string().optional().or(z.literal("")),
  engineNumber: z.string().optional().or(z.literal("")),
  chassisNumber: z.string().optional().or(z.literal(""))
});

// Order validation schema (for creation)
export const createOrderSchema = z.object({
  customerId: z.string().min(1, "Customer ID is required"),
  vehicleId: z.string().min(1, "Vehicle ID is required"),
  services: z.array(serviceSchema).min(1, "At least one service is required"),
  notes: z.string().optional().or(z.literal(""))
});

// Combined order creation with customer and vehicle data
export const createOrderWithDataSchema = z.object({
  customer: createCustomerSchema,
  vehicle: createVehicleSchema,
  services: z.array(serviceSchema).min(1, "At least one service is required"),
  notes: z.string().optional().or(z.literal(""))
});

// Type exports
export type ServiceInput = z.infer<typeof serviceSchema>;
export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type CreateVehicleInput = z.infer<typeof createVehicleSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type CreateOrderWithDataInput = z.infer<typeof createOrderWithDataSchema>;
