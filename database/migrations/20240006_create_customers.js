exports.up = function(knex) {
  return knex.schema.createTable('customers', (table) => {
    table.uuid('id').primary();
    table.string('name').notNullable();
    table.string('phone', 20).notNullable();
    table.string('email').nullable();
    table.text('address').nullable();
    table.string('city', 100).nullable();
    table.string('state', 100).nullable();
    table.string('pincode', 10).nullable();
    table.string('gst_number', 20).nullable();
    table.integer('loyalty_points').defaultTo(0);
    table.decimal('total_purchases', 15, 2).defaultTo(0);
    table.date('anniversary_date').nullable();
    table.date('birthday').nullable();
    table.text('notes').nullable();
    table.timestamps(true, true);
  });
};
exports.down = function(knex) {
  return knex.schema.dropTable('customers');
};
