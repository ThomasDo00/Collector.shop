import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Enable UUID extension
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

  // Create users table
  await knex.schema.createTable('users', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('email', 255).notNullable().unique();
    table.string('username', 30).notNullable().unique();
    table.string('password_hash', 255).notNullable();
    table
      .enum('role', ['visitor', 'buyer', 'seller', 'admin'], {
        useNative: true,
        enumName: 'user_role',
      })
      .notNullable()
      .defaultTo('buyer');
    table
      .enum('status', ['pending', 'active', 'suspended', 'banned'], {
        useNative: true,
        enumName: 'user_status',
      })
      .notNullable()
      .defaultTo('pending');
    table.string('first_name', 100);
    table.string('last_name', 100);
    table.string('avatar_url', 500);
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('last_login_at');

    // Indexes for faster queries
    table.index('email');
    table.index('username');
    table.index('status');
    table.index('created_at');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('users');
  await knex.raw('DROP TYPE IF EXISTS user_role');
  await knex.raw('DROP TYPE IF EXISTS user_status');
}
