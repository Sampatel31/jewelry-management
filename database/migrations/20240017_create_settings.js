exports.up = function(knex) {
  return knex.schema.createTable('settings', (table) => {
    table.uuid('id').primary();
    table.string('key').notNullable().unique();
    table.text('value').nullable();
    table.text('description').nullable();
  });
};
exports.down = function(knex) {
  return knex.schema.dropTable('settings');
};
