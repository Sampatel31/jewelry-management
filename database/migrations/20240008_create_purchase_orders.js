exports.up = function(knex) {
  return knex.schema.createTable('purchase_orders', (table) => {
    table.uuid('id').primary();
    table.string('po_number').notNullable().unique();
    table.uuid('supplier_id').references('id').inTable('suppliers').onDelete('SET NULL');
    table.enum('status', ['draft', 'ordered', 'received', 'cancelled']).defaultTo('draft');
    table.date('order_date').notNullable();
    table.date('expected_date').nullable();
    table.date('received_date').nullable();
    table.decimal('total_amount', 15, 2).defaultTo(0);
    table.text('notes').nullable();
    table.uuid('created_by').references('id').inTable('users').onDelete('SET NULL');
    table.timestamps(true, true);
  });
};
exports.down = function(knex) {
  return knex.schema.dropTable('purchase_orders');
};
