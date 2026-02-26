exports.up = function(knex) {
  return knex.schema.createTable('roles', (table) => {
    table.uuid('id').primary();
    table.string('name', 50).notNullable().unique();
    table.jsonb('permissions').defaultTo('{}');
    table.timestamps(true, true);
  });
};
exports.down = function(knex) {
  return knex.schema.dropTable('roles');
};
