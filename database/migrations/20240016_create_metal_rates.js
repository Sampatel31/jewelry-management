exports.up = function(knex) {
  return knex.schema.createTable('metal_rates', (table) => {
    table.uuid('id').primary();
    table.enum('metal_type', ['gold', 'silver', 'platinum']).notNullable();
    table.string('purity', 10).notNullable();
    table.decimal('rate_per_gram', 12, 2).notNullable();
    table.date('effective_date').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
};
exports.down = function(knex) {
  return knex.schema.dropTable('metal_rates');
};
