import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('old_gold_transactions', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('customer_id').nullable().references('id').inTable('customers').onDelete('SET NULL');
    t.uuid('invoice_id').nullable().references('id').inTable('invoices').onDelete('SET NULL');
    t.string('metal_type', 20).notNullable().defaultTo('gold');
    t.string('purity', 10).notNullable();
    t.decimal('weight_gm', 10, 3).notNullable();
    t.decimal('rate_per_gram', 12, 2).notNullable();
    t.decimal('exchange_value', 15, 2).notNullable();
    t.string('status', 20).notNullable().defaultTo('received');
    t.text('notes').nullable();
    t.uuid('created_by').nullable().references('id').inTable('users').onDelete('SET NULL');
    t.timestamps(true, true);
  });
  await knex.schema.raw('CREATE INDEX idx_old_gold_customer_id ON old_gold_transactions(customer_id)');
  await knex.schema.raw('CREATE INDEX idx_old_gold_invoice_id ON old_gold_transactions(invoice_id)');
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('old_gold_transactions');
}
