export interface Product {
  id: string;
  sku: string;
  name: string;
  category_id: string;
  category_name?: string;
  metal_type: 'gold' | 'silver' | 'platinum' | 'other';
  metal_purity: string;
  metal_weight_gm: number;
  stone_type?: string;
  stone_weight_ct?: number;
  making_charges: number;
  base_price: number;
  selling_price: number;
  stock_qty: number;
  min_stock_qty: number;
  barcode?: string;
  hsn_code: string;
  cgst_rate: number;
  sgst_rate: number;
  is_active: boolean;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  loyalty_points: number;
  total_purchases: number;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  customer_id?: string;
  customer_name?: string;
  invoice_date: string;
  subtotal: number;
  discount_amount: number;
  cgst_amount: number;
  sgst_amount: number;
  total_amount: number;
  paid_amount: number;
  payment_status: 'unpaid' | 'partial' | 'paid';
  payment_mode: string;
  items?: InvoiceItem[];
}

export interface InvoiceItem {
  id: string;
  product_id: string;
  product_name: string;
  hsn_code: string;
  quantity: number;
  unit_price: number;
  making_charges: number;
  stone_charges: number;
  discount: number;
  cgst_rate: number;
  sgst_rate: number;
  total_price: number;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact_person: string;
  phone: string;
  email?: string;
  city?: string;
  state?: string;
  gst_number?: string;
}

export interface PurchaseOrder {
  id: string;
  po_number: string;
  supplier_id: string;
  supplier_name?: string;
  status: 'draft' | 'ordered' | 'received' | 'cancelled';
  order_date: string;
  total_amount: number;
}

export interface Repair {
  id: string;
  repair_number: string;
  customer_id: string;
  customer_name?: string;
  item_description: string;
  issue_description: string;
  status: 'received' | 'diagnosing' | 'in_repair' | 'ready' | 'delivered';
  received_date: string;
  estimated_cost: number;
  final_cost?: number;
}

export interface ProductionJob {
  id: string;
  job_number: string;
  product_id: string;
  product_name?: string;
  quantity: number;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  assigned_to?: string;
  start_date?: string;
  expected_date?: string;
}
