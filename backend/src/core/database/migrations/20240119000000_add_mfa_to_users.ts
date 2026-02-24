import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('users', (table) => {
    table.boolean('mfa_enabled').notNullable().defaultTo(false);
    table.string('mfa_secret', 64).nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('users', (table) => {
    table.dropColumn('mfa_enabled');
    table.dropColumn('mfa_secret');
  });
}
