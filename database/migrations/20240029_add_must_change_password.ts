import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.table('users', (t) => {
    t.boolean('must_change_password').defaultTo(false).notNullable();
  });
  // Set must_change_password = true for the default seeded admin user
  await knex('users')
    .where('email', 'admin@jewelry.com')
    .orWhere('email', 'admin@shrigarjewellers.com')
    .update({ must_change_password: true });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.table('users', (t) => {
    t.dropColumn('must_change_password');
  });
}
