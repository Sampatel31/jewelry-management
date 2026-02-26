exports.up = function(knex) {
  return knex.schema.createTable('users', (table) => {
    table.uuid('id').primary();
    table.string('name').notNullable();
    table.string('email').notNullable().unique();
    table.string('password_hash').notNullable();
    table.uuid('role_id').references('id').inTable('roles').onDelete('SET NULL');
    table.string('phone', 20);
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
  });
};
exports.down = function(knex) {
  return knex.schema.dropTable('users');
};
