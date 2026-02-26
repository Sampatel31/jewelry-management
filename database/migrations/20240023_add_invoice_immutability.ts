import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Add invoice_hash column to invoices
  await knex.schema.alterTable('invoices', (t) => {
    t.string('invoice_hash', 64).nullable();
    t.string('finalization_status', 20).nullable().defaultTo('draft');
  });

  // Create credit_notes table
  await knex.schema.createTable('credit_notes', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('invoice_id').notNullable().references('id').inTable('invoices').onDelete('RESTRICT');
    t.text('reason').notNullable();
    t.decimal('amount', 14, 2).notNullable();
    t.decimal('cgst', 10, 2).notNullable().defaultTo(0);
    t.decimal('sgst', 10, 2).notNullable().defaultTo(0);
    t.uuid('issued_by').notNullable().references('id').inTable('users').onDelete('RESTRICT');
    t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
  });

  // Create debit_notes table
  await knex.schema.createTable('debit_notes', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('invoice_id').notNullable().references('id').inTable('invoices').onDelete('RESTRICT');
    t.text('reason').notNullable();
    t.decimal('amount', 14, 2).notNullable();
    t.decimal('cgst', 10, 2).notNullable().defaultTo(0);
    t.decimal('sgst', 10, 2).notNullable().defaultTo(0);
    t.uuid('issued_by').notNullable().references('id').inTable('users').onDelete('RESTRICT');
    t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
  });

  await knex.schema.raw('CREATE INDEX idx_credit_notes_invoice_id ON credit_notes(invoice_id)');
  await knex.schema.raw('CREATE INDEX idx_debit_notes_invoice_id ON debit_notes(invoice_id)');
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('debit_notes');
  await knex.schema.dropTableIfExists('credit_notes');
  await knex.schema.alterTable('invoices', (t) => {
    t.dropColumn('invoice_hash');
    t.dropColumn('finalization_status');
  });
}
