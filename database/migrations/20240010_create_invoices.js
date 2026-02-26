exports.up = function(knex) {
  return knex.schema.createTable('invoices', (table) => {
    table.uuid('id').primary();
    table.string('invoice_number').notNullable().unique();
    table.uuid('customer_id').references('id').inTable('customers').onDelete('SET NULL').nullable();
    table.date('invoice_date').notNullable();
    table.date('due_date').nullable();
    table.decimal('subtotal', 15, 2).defaultTo(0);
    table.decimal('discount_amount', 15, 2).defaultTo(0);
    table.decimal('discount_percent', 5, 2).defaultTo(0);
    table.decimal('cgst_amount', 15, 2).defaultTo(0);
    table.decimal('sgst_amount', 15, 2).defaultTo(0);
    table.decimal('igst_amount', 15, 2).defaultTo(0);
    table.decimal('total_amount', 15, 2).defaultTo(0);
    table.decimal('paid_amount', 15, 2).defaultTo(0);
    table.enum('payment_status', ['unpaid', 'partial', 'paid']).defaultTo('unpaid');
    table.enum('payment_mode', ['cash', 'card', 'upi', 'cheque', 'emi', 'mixed']).defaultTo('cash');
    table.text('notes').nullable();
    table.uuid('created_by').references('id').inTable('users').onDelete('SET NULL');
    table.timestamps(true, true);
  });
};
exports.down = function(knex) {
  return knex.schema.dropTable('invoices');
};
