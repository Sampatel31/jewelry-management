import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.table('products', (t) => {
    t.decimal('wastage_pct', 5, 2).defaultTo(0);
    t.string('making_charges_type', 10).defaultTo('flat');
    t.decimal('making_charges_per_gram', 12, 2).defaultTo(0);
    t.string('stone_quality_grade', 10).nullable();
    t.decimal('stone_price_per_carat', 12, 2).defaultTo(0);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.table('products', (t) => {
    t.dropColumn('wastage_pct');
    t.dropColumn('making_charges_type');
    t.dropColumn('making_charges_per_gram');
    t.dropColumn('stone_quality_grade');
    t.dropColumn('stone_price_per_carat');
  });
}
