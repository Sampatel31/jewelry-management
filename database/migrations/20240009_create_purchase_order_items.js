exports.up = function(knex) {
  return knex.schema.createTable('purchase_order_items', (table) => {
    table.uuid('id').primary();
    table.uuid('po_id').references('id').inTable('purchase_orders').onDelete('CASCADE');
    table.uuid('product_id').references('id').inTable('products').onDelete('CASCADE');
    table.integer('quantity').notNullable();
    table.decimal('unit_price', 12, 2).notNullable();
    table.decimal('total_price', 12, 2).notNullable();
    table.integer('received_qty').defaultTo(0);
  });
};
exports.down = function(knex) {
  return knex.schema.dropTable('purchase_order_items');
};
