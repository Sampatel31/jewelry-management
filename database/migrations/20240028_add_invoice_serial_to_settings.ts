import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.table('invoices', (t) => {
    t.string('invoice_prefix', 20).defaultTo('INV').after('invoice_number');
    t.string('financial_year', 10).nullable().after('invoice_prefix');
    t.integer('serial_number').nullable().after('financial_year');
    t.boolean('is_interstate').defaultTo(false).after('serial_number');
    t.decimal('old_gold_value', 15, 2).defaultTo(0).after('is_interstate');
    t.uuid('old_gold_transaction_id').nullable().after('old_gold_value');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.table('invoices', (t) => {
    t.dropColumn('invoice_prefix');
    t.dropColumn('financial_year');
    t.dropColumn('serial_number');
    t.dropColumn('is_interstate');
    t.dropColumn('old_gold_value');
    t.dropColumn('old_gold_transaction_id');
  });
}
