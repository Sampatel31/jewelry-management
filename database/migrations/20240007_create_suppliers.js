exports.up = function(knex) {
  return knex.schema.createTable('suppliers', (table) => {
    table.uuid('id').primary();
    table.string('name').notNullable();
    table.string('contact_person').nullable();
    table.string('phone', 20).notNullable();
    table.string('email').nullable();
    table.text('address').nullable();
    table.string('city', 100).nullable();
    table.string('state', 100).nullable();
    table.string('gst_number', 20).nullable();
    table.jsonb('metal_types_supplied').defaultTo('[]');
    table.integer('rating').defaultTo(0);
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
  });
};
exports.down = function(knex) {
  return knex.schema.dropTable('suppliers');
};
