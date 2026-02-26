exports.up = function(knex) {
  return knex.schema.createTable('repairs', (table) => {
    table.uuid('id').primary();
    table.string('repair_number').notNullable().unique();
    table.uuid('customer_id').references('id').inTable('customers').onDelete('CASCADE');
    table.string('item_description').notNullable();
    table.text('issue_description').notNullable();
    table.enum('status', ['received', 'diagnosing', 'in_repair', 'ready', 'delivered']).defaultTo('received');
    table.date('received_date').notNullable();
    table.date('expected_date').nullable();
    table.date('delivered_date').nullable();
    table.decimal('estimated_cost', 12, 2).defaultTo(0);
    table.decimal('final_cost', 12, 2).nullable();
    table.decimal('advance_paid', 12, 2).defaultTo(0);
    table.uuid('assigned_to').references('id').inTable('users').onDelete('SET NULL').nullable();
    table.text('notes').nullable();
    table.timestamps(true, true);
  });
};
exports.down = function(knex) {
  return knex.schema.dropTable('repairs');
};
