import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('ai_interaction_logs', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('user_id').nullable().references('id').inTable('users').onDelete('SET NULL');
    t.string('user_role', 50).nullable();
    t.text('user_message').notNullable();
    t.text('ai_response').notNullable();
    t.boolean('used_fallback').notNullable().defaultTo(false);
    t.jsonb('context_snapshot').nullable();
    t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
  });
  await knex.schema.raw('CREATE INDEX idx_ai_logs_user_id ON ai_interaction_logs(user_id)');
  await knex.schema.raw('CREATE INDEX idx_ai_logs_created_at ON ai_interaction_logs(created_at)');
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('ai_interaction_logs');
}
