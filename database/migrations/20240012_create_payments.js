exports.up = function(knex) {
  return knex.schema.createTable('payments', (table) => {
    table.uuid('id').primary();
    table.uuid('invoice_id').references('id').inTable('invoices').onDelete('CASCADE');
    table.decimal('amount', 15, 2).notNullable();
    table.enum('payment_mode', ['cash', 'card', 'upi', 'cheque', 'emi']).notNullable();
    table.date('payment_date').notNullable();
    table.string('reference_number', 100).nullable();
    table.text('notes').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
};
exports.down = function(knex) {
  return knex.schema.dropTable('payments');
};
