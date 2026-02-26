exports.up = function(knex) {
  return knex.schema.createTable('bom_items', (table) => {
    table.uuid('id').primary();
    table.uuid('product_id').references('id').inTable('products').onDelete('CASCADE');
    table.string('material_name').notNullable();
    table.string('material_type', 50).nullable();
    table.decimal('quantity', 10, 3).notNullable();
    table.string('unit', 20).notNullable();
    table.decimal('unit_cost', 12, 2).defaultTo(0);
  });
};
exports.down = function(knex) {
  return knex.schema.dropTable('bom_items');
};
