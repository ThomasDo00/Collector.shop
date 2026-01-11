import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Enable UUID extension if not already enabled
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

  // Create reviews table
  await knex.schema.createTable('reviews', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('seller_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.uuid('buyer_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.uuid('product_id').references('id').inTable('products').onDelete('SET NULL');
    table.integer('rating').notNullable().checkBetween([1, 5]);
    table.text('comment');
    table.timestamps(true, true);

    // Indexes
    table.index('seller_id');
    table.index('buyer_id');
    table.index('rating');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('reviews');
}
