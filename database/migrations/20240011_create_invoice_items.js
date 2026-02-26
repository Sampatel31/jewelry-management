exports.up = function(knex) {
  return knex.schema.createTable('invoice_items', (table) => {
    table.uuid('id').primary();
    table.uuid('invoice_id').references('id').inTable('invoices').onDelete('CASCADE');
    table.uuid('product_id').references('id').inTable('products').onDelete('SET NULL').nullable();
    table.string('product_name').notNullable();
    table.string('hsn_code', 20).nullable();
    table.integer('quantity').notNullable();
    table.decimal('unit_price', 12, 2).notNullable();
    table.decimal('making_charges', 12, 2).defaultTo(0);
    table.decimal('stone_charges', 12, 2).defaultTo(0);
    table.decimal('discount', 12, 2).defaultTo(0);
    table.decimal('cgst_rate', 5, 2).defaultTo(1.5);
    table.decimal('sgst_rate', 5, 2).defaultTo(1.5);
    table.decimal('total_price', 12, 2).notNullable();
  });
};
exports.down = function(knex) {
  return knex.schema.dropTable('invoice_items');
};
