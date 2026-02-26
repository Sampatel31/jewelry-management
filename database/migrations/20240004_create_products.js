exports.up = function(knex) {
  return knex.schema.createTable('products', (table) => {
    table.uuid('id').primary();
    table.string('sku').notNullable().unique();
    table.string('name').notNullable();
    table.uuid('category_id').references('id').inTable('categories').onDelete('SET NULL');
    table.enum('metal_type', ['gold', 'silver', 'platinum', 'other']).notNullable();
    table.string('metal_purity', 10);
    table.decimal('metal_weight_gm', 10, 3).defaultTo(0);
    table.string('stone_type', 100).nullable();
    table.decimal('stone_weight_ct', 10, 3).nullable();
    table.string('stone_quality', 100).nullable();
    table.decimal('making_charges', 12, 2).defaultTo(0);
    table.decimal('base_price', 12, 2).defaultTo(0);
    table.decimal('selling_price', 12, 2).defaultTo(0);
    table.integer('stock_qty').defaultTo(0);
    table.integer('min_stock_qty').defaultTo(5);
    table.string('barcode').unique().nullable();
    table.string('image_url').nullable();
    table.text('description').nullable();
    table.string('hsn_code', 20);
    table.decimal('cgst_rate', 5, 2).defaultTo(1.5);
    table.decimal('sgst_rate', 5, 2).defaultTo(1.5);
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
  });
};
exports.down = function(knex) {
  return knex.schema.dropTable('products');
};
