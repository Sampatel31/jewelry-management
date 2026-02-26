import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('audit_logs', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('user_id').nullable().references('id').inTable('users').onDelete('SET NULL');
    t.string('action', 20).notNullable();
    t.string('table_name', 100).notNullable();
    t.string('record_id', 100).notNullable();
    t.jsonb('old_values').nullable();
    t.jsonb('new_values').nullable();
    t.string('ip_address', 45).nullable();
    t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
  });
  await knex.schema.raw('CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id)');
  await knex.schema.raw('CREATE INDEX idx_audit_logs_table_record ON audit_logs(table_name, record_id)');
  await knex.schema.raw('CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at)');
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('audit_logs');
}
