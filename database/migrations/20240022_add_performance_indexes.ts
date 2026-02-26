import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const indexes: string[] = [
    // products
    'CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id)',
    'CREATE INDEX IF NOT EXISTS idx_products_metal_type ON products(metal_type)',
    'CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode)',
    'CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku)',
    'CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active)',
    "CREATE INDEX IF NOT EXISTS idx_products_not_deleted ON products(id) WHERE deleted_at IS NULL",
    // invoices
    'CREATE INDEX IF NOT EXISTS idx_invoices_customer_id ON invoices(customer_id)',
    'CREATE INDEX IF NOT EXISTS idx_invoices_invoice_date ON invoices(invoice_date)',
    'CREATE INDEX IF NOT EXISTS idx_invoices_payment_status ON invoices(payment_status)',
    'CREATE INDEX IF NOT EXISTS idx_invoices_created_at ON invoices(created_at)',
    "CREATE INDEX IF NOT EXISTS idx_invoices_not_deleted ON invoices(id) WHERE deleted_at IS NULL",
    // invoice_items
    'CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON invoice_items(invoice_id)',
    'CREATE INDEX IF NOT EXISTS idx_invoice_items_product_id ON invoice_items(product_id)',
    // customers
    'CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone)',
    'CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email)',
    "CREATE INDEX IF NOT EXISTS idx_customers_not_deleted ON customers(id) WHERE deleted_at IS NULL",
    // suppliers
    'CREATE INDEX IF NOT EXISTS idx_suppliers_name ON suppliers(name)',
    "CREATE INDEX IF NOT EXISTS idx_suppliers_not_deleted ON suppliers(id) WHERE deleted_at IS NULL",
    // inventory_transactions
    'CREATE INDEX IF NOT EXISTS idx_inv_tx_product_id ON inventory_transactions(product_id)',
    'CREATE INDEX IF NOT EXISTS idx_inv_tx_created_at ON inventory_transactions(created_at)',
    // production_jobs
    'CREATE INDEX IF NOT EXISTS idx_prod_jobs_status ON production_jobs(status)',
    "CREATE INDEX IF NOT EXISTS idx_prod_jobs_not_deleted ON production_jobs(id) WHERE deleted_at IS NULL",
    // repairs
    'CREATE INDEX IF NOT EXISTS idx_repairs_customer_id ON repairs(customer_id)',
    'CREATE INDEX IF NOT EXISTS idx_repairs_status ON repairs(status)',
    "CREATE INDEX IF NOT EXISTS idx_repairs_not_deleted ON repairs(id) WHERE deleted_at IS NULL",
  ];

  for (const sql of indexes) {
    await knex.raw(sql);
  }
}

export async function down(knex: Knex): Promise<void> {
  // Indexes will be dropped with the tables or can be removed manually
}
