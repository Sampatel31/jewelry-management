import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

export const validate = (schema: z.ZodTypeAny) =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        message: 'Validation error',
        errors: result.error.flatten().fieldErrors,
      });
    }
    req.body = result.data;
    next();
  };

export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

const passwordStrength = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: passwordStrength,
});

// Product schemas
export const createProductSchema = z.object({
  name: z.string().min(1),
  sku: z.string().min(1),
  category_id: z.string().uuid(),
  metal_type: z.string().optional(),
  purity: z.string().optional(),
  weight: z.number().positive().optional(),
  selling_price: z.number().nonnegative(),
  cost_price: z.number().nonnegative().optional(),
  stock_qty: z.number().int().nonnegative().optional(),
  min_stock_qty: z.number().int().nonnegative().optional(),
  barcode: z.string().optional(),
  description: z.string().optional(),
  making_charges: z.number().nonnegative().optional(),
  wastage_percent: z.number().nonnegative().optional(),
  hsn_code: z.string().optional(),
  gst_rate: z.number().nonnegative().optional(),
}).passthrough();

// Category schemas
export const createCategorySchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  metal_type: z.string().optional(),
  gst_rate: z.number().nonnegative().optional(),
}).passthrough();

// Customer schemas
export const createCustomerSchema = z.object({
  name: z.string().min(1),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().optional(),
  gst_number: z.string().optional(),
}).passthrough();

// Supplier schemas
export const createSupplierSchema = z.object({
  name: z.string().min(1),
  contact_person: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().optional(),
  gst_number: z.string().optional(),
}).passthrough();

// Purchase order schemas
export const createPurchaseOrderSchema = z.object({
  supplier_id: z.string().uuid(),
  order_date: z.string().optional(),
  expected_date: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(z.object({
    product_id: z.string().uuid(),
    quantity: z.number().positive(),
    unit_price: z.number().nonnegative(),
  })).optional(),
}).passthrough();

// Invoice schemas
export const createInvoiceSchema = z.object({
  customer_id: z.string().uuid().optional().nullable(),
  invoice_number: z.string().optional(),
  invoice_date: z.string().optional(),
  discount_amount: z.number().nonnegative().optional(),
  payment_mode: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(z.object({
    product_id: z.string().uuid(),
    quantity: z.number().positive(),
    unit_price: z.number().nonnegative(),
    discount: z.number().nonnegative().optional(),
  })),
  payments: z.array(z.any()).optional(),
}).passthrough();

// POS sale schema
export const completeSaleSchema = z.object({
  items: z.array(z.object({
    product_id: z.string().uuid(),
    quantity: z.number().positive(),
    unit_price: z.number().nonnegative(),
  })).min(1),
  customer_id: z.string().uuid().optional().nullable(),
  payment_mode: z.string(),
  paid_amount: z.number().nonnegative(),
  discount_amount: z.number().nonnegative().optional(),
}).passthrough();

// Production job schemas
export const createJobSchema = z.object({
  product_id: z.string().uuid(),
  quantity: z.number().positive(),
  assigned_to: z.string().uuid().optional().nullable(),
  due_date: z.string().optional(),
  notes: z.string().optional(),
}).passthrough();

// Repair schemas
export const createRepairSchema = z.object({
  customer_id: z.string().uuid(),
  item_description: z.string().min(1),
  issue_description: z.string().optional(),
  estimated_cost: z.number().nonnegative().optional(),
  advance_amount: z.number().nonnegative().optional(),
  expected_date: z.string().optional(),
}).passthrough();

// Settings schema
export const updateSettingSchema = z.object({
  key: z.string().min(1),
  value: z.string(),
}).passthrough();

// Inventory adjustment schema
export const inventoryAdjustmentSchema = z.object({
  product_id: z.string().uuid(),
  quantity: z.number(),
  transaction_type: z.enum(['adjustment', 'purchase', 'sale', 'return', 'production']),
  notes: z.string().optional(),
}).passthrough();
