exports.up = function(knex) {
  return knex.schema.createTable('inventory_transactions', (table) => {
    table.uuid('id').primary();
    table.uuid('product_id').references('id').inTable('products').onDelete('CASCADE');
    table.enum('transaction_type', ['purchase', 'sale', 'adjustment', 'return', 'production']).notNullable();
    table.integer('quantity').notNullable();
    table.uuid('reference_id').nullable();
    table.string('reference_type', 50).nullable();
    table.text('notes').nullable();
    table.uuid('created_by').references('id').inTable('users').onDelete('SET NULL');
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
};
exports.down = function(knex) {
  return knex.schema.dropTable('inventory_transactions');
};
