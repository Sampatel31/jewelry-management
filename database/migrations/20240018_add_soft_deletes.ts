import { Knex } from 'knex';

const tables = ['products', 'customers', 'suppliers', 'invoices', 'production_jobs', 'repairs'];

export async function up(knex: Knex): Promise<void> {
  for (const table of tables) {
    await knex.schema.alterTable(table, (t) => {
      t.timestamp('deleted_at').nullable().defaultTo(null);
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  for (const table of tables) {
    await knex.schema.alterTable(table, (t) => {
      t.dropColumn('deleted_at');
    });
  }
}
