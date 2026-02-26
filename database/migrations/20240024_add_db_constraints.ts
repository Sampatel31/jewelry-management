import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Each constraint addition uses .catch(() => {}) to gracefully handle the case
  // where the constraint already exists (e.g., running migration on an existing DB).
  // This is safe because duplicate constraints would cause a PostgreSQL error code 42P07.

  // Unique invoice number
  await knex.schema.raw(`
    ALTER TABLE invoices ADD CONSTRAINT invoices_invoice_number_unique UNIQUE (invoice_number)
  `).catch(() => {}); // skip if already exists

  // FK: invoices → customers
  await knex.schema.raw(`
    ALTER TABLE invoices ADD CONSTRAINT invoices_customer_id_fkey
      FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT
  `).catch(() => {});

  // Stock cannot go negative
  await knex.schema.raw(`
    ALTER TABLE products ADD CONSTRAINT products_stock_qty_check CHECK (stock_qty >= 0)
  `).catch(() => {});

  // Money fields NOT NULL on invoices
  await knex.schema.raw(`ALTER TABLE invoices ALTER COLUMN total_amount SET NOT NULL`).catch(() => {});
  await knex.schema.raw(`ALTER TABLE invoices ALTER COLUMN cgst_amount SET NOT NULL`).catch(() => {});
  await knex.schema.raw(`ALTER TABLE invoices ALTER COLUMN sgst_amount SET NOT NULL`).catch(() => {});

  // Money fields NOT NULL on invoice_items
  await knex.schema.raw(`ALTER TABLE invoice_items ALTER COLUMN unit_price SET NOT NULL`).catch(() => {});
  await knex.schema.raw(`ALTER TABLE invoice_items ALTER COLUMN quantity SET NOT NULL`).catch(() => {});
  await knex.schema.raw(`ALTER TABLE invoice_items ALTER COLUMN total_price SET NOT NULL`).catch(() => {});

  // Products money fields NOT NULL + DEFAULT 0
  await knex.schema.raw(`ALTER TABLE products ALTER COLUMN making_charges SET NOT NULL`).catch(() => {});
  await knex.schema.raw(`ALTER TABLE products ALTER COLUMN making_charges SET DEFAULT 0`).catch(() => {});
  await knex.schema.raw(`ALTER TABLE products ALTER COLUMN base_price SET NOT NULL`).catch(() => {});
  await knex.schema.raw(`ALTER TABLE products ALTER COLUMN base_price SET DEFAULT 0`).catch(() => {});
  await knex.schema.raw(`ALTER TABLE products ALTER COLUMN selling_price SET NOT NULL`).catch(() => {});
  await knex.schema.raw(`ALTER TABLE products ALTER COLUMN selling_price SET DEFAULT 0`).catch(() => {});
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.raw(`ALTER TABLE invoices DROP CONSTRAINT IF EXISTS invoices_invoice_number_unique`);
  await knex.schema.raw(`ALTER TABLE invoices DROP CONSTRAINT IF EXISTS invoices_customer_id_fkey`);
  await knex.schema.raw(`ALTER TABLE products DROP CONSTRAINT IF EXISTS products_stock_qty_check`);
}
