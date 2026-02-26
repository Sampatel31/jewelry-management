import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('refresh_tokens', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.text('token_hash').notNullable().unique();
    t.timestamp('expires_at').notNullable();
    t.boolean('revoked').notNullable().defaultTo(false);
    t.string('ip_address', 45).nullable();
    t.string('user_agent').nullable();
    t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    t.timestamp('revoked_at').nullable();
  });
  await knex.schema.raw('CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id)');
  await knex.schema.raw('CREATE INDEX idx_refresh_tokens_token_hash ON refresh_tokens(token_hash)');
  await knex.schema.raw("CREATE INDEX idx_refresh_tokens_active ON refresh_tokens(user_id) WHERE revoked = false");
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('refresh_tokens');
}
