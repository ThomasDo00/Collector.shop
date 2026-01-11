import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Enable UUID extension if not already enabled
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

  // Create orders table
  await knex.schema.createTable('orders', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('buyer_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.uuid('seller_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.uuid('product_id').notNullable().references('id').inTable('products').onDelete('RESTRICT');

    // Pricing
    table.decimal('subtotal', 10, 2).notNullable();
    table.decimal('commission', 10, 2).notNullable();
    table.decimal('shipping', 10, 2).notNullable();
    table.decimal('total', 10, 2).notNullable();

    // Status
    table.enum('status', ['pending', 'paid', 'shipped', 'delivered', 'cancelled', 'refunded']).defaultTo('pending');

    // Shipping address
    table.string('shipping_first_name', 100).notNullable();
    table.string('shipping_last_name', 100).notNullable();
    table.string('shipping_address', 255).notNullable();
    table.string('shipping_address_line2', 255);
    table.string('shipping_city', 100).notNullable();
    table.string('shipping_postal_code', 20).notNullable();
    table.string('shipping_country', 100).notNullable();
    table.string('shipping_phone', 50).notNullable();

    // Payment
    table.string('stripe_payment_intent_id', 255);
    table.timestamp('paid_at');
    table.timestamp('shipped_at');
    table.timestamp('delivered_at');

    table.timestamps(true, true);

    // Indexes
    table.index('buyer_id');
    table.index('seller_id');
    table.index('product_id');
    table.index('status');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('orders');
}
