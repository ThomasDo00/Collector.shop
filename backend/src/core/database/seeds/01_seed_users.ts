import { Knex } from 'knex';
import bcrypt from 'bcrypt';
import { logger } from '../../../core/logger/index.js';

/**
 * Seed users table with test data
 * This file is shared across all developers for consistent test data
 */
export async function seed(knex: Knex): Promise<void> {
  // Clear existing data
  await knex('users').del();

  // Hash password once for all users (password: "Test123!@#")
  const passwordHash = await bcrypt.hash('Test123!@#', 12);

  // Insert test users
  await knex('users').insert([
    {
      id: '550e8400-e29b-41d4-a716-446655440001',
      email: 'buyer1@collector.shop',
      username: 'sneaker_hunter',
      password_hash: passwordHash,
      role: 'buyer',
      status: 'active',
      first_name: 'Jean',
      last_name: 'Dupont',
      avatar_url: 'https://i.pravatar.cc/150?img=1',
      created_at: new Date('2024-01-15'),
      updated_at: new Date('2024-01-15'),
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440002',
      email: 'seller1@collector.shop',
      username: 'vintage_collector',
      password_hash: passwordHash,
      role: 'seller',
      status: 'active',
      first_name: 'Marie',
      last_name: 'Martin',
      avatar_url: 'https://i.pravatar.cc/150?img=2',
      bio: 'Collectionneur passionne de sneakers depuis 2015. Je vends uniquement des pieces authentiques, avec preuves d\'achat et verification possible.',
      location: 'Paris, France',
      created_at: new Date('2021-03-15'),
      updated_at: new Date('2024-02-10'),
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440003',
      email: 'admin@collector.shop',
      username: 'admin',
      password_hash: passwordHash,
      role: 'admin',
      status: 'active',
      first_name: 'Admin',
      last_name: 'System',
      avatar_url: 'https://i.pravatar.cc/150?img=3',
      created_at: new Date('2023-12-01'),
      updated_at: new Date('2023-12-01'),
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440004',
      email: 'buyer2@collector.shop',
      username: 'poster_lover',
      password_hash: passwordHash,
      role: 'buyer',
      status: 'active',
      first_name: 'Pierre',
      last_name: 'Durand',
      avatar_url: 'https://i.pravatar.cc/150?img=4',
      created_at: new Date('2024-03-05'),
      updated_at: new Date('2024-03-05'),
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440005',
      email: 'seller2@collector.shop',
      username: 'retro_gamer',
      password_hash: passwordHash,
      role: 'seller',
      status: 'active',
      first_name: 'Sophie',
      last_name: 'Bernard',
      avatar_url: 'https://i.pravatar.cc/150?img=5',
      created_at: new Date('2024-01-20'),
      updated_at: new Date('2024-01-20'),
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440006',
      email: 'pending@collector.shop',
      username: 'new_user',
      password_hash: passwordHash,
      role: 'buyer',
      status: 'pending',
      first_name: 'Lucas',
      last_name: 'Petit',
      avatar_url: null,
      created_at: new Date(),
      updated_at: new Date(),
    },
  ]);

  logger.info('✅ Users seeded successfully');
  logger.info('📧 Test credentials:');
  logger.info('   Email: buyer1@collector.shop');
  logger.info('   Password: Test123!@#');
}
