exports.up = function(knex) {
  return knex.schema.createTable('categories', (table) => {
    table.uuid('id').primary();
    table.string('name').notNullable();
    table.text('description');
    table.uuid('parent_id').references('id').inTable('categories').onDelete('SET NULL').nullable();
    table.timestamps(true, true);
  });
};
exports.down = function(knex) {
  return knex.schema.dropTable('categories');
};
