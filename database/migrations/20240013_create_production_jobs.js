exports.up = function(knex) {
  return knex.schema.createTable('production_jobs', (table) => {
    table.uuid('id').primary();
    table.string('job_number').notNullable().unique();
    table.uuid('product_id').references('id').inTable('products').onDelete('CASCADE');
    table.integer('quantity').notNullable();
    table.enum('status', ['pending', 'in_progress', 'completed', 'cancelled']).defaultTo('pending');
    table.uuid('assigned_to').references('id').inTable('users').onDelete('SET NULL').nullable();
    table.date('start_date').nullable();
    table.date('expected_date').nullable();
    table.date('completed_date').nullable();
    table.text('notes').nullable();
    table.uuid('created_by').references('id').inTable('users').onDelete('SET NULL');
    table.timestamps(true, true);
  });
};
exports.down = function(knex) {
  return knex.schema.dropTable('production_jobs');
};
