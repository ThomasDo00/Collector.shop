import { Knex } from 'knex';
import { logger } from '../../../core/logger/index.js';

export async function up(knex: Knex): Promise<void> {
  // Create categories table
  await knex.schema.createTable('categories', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('name', 100).notNullable();
    table.string('slug', 100).notNullable().unique();
    table.text('description');
    table.string('icon_url', 500);
    table.integer('product_count').defaultTo(0);
    table.timestamps(true, true);

    table.index('slug');
  });

  // Create products table
  await knex.schema.createTable('products', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('title', 255).notNullable();
    table.text('description');
    table.decimal('price', 10, 2).notNullable();
    table.decimal('original_price', 10, 2);
    table.string('image_url', 500).notNullable();
    table.uuid('category_id').references('id').inTable('categories').onDelete('SET NULL');
    table.string('category_name', 100); // Denormalized for faster queries
    table.enum('condition', ['new', 'like_new', 'very_good', 'good', 'acceptable']).notNullable();
    table.enum('status', ['active', 'sold', 'reserved', 'inactive']).defaultTo('active');
    table.uuid('seller_id').references('id').inTable('users').onDelete('CASCADE');
    table.timestamps(true, true);

    table.index('category_id');
    table.index('seller_id');
    table.index('status');
    table.index('created_at');
  });

  logger.info('✅ Categories and Products tables created');
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('products');
  await knex.schema.dropTableIfExists('categories');
}
