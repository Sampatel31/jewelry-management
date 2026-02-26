import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.table('users', (t) => {
    t.string('billing_pin_hash', 100).nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.table('users', (t) => {
    t.dropColumn('billing_pin_hash');
  });
}
