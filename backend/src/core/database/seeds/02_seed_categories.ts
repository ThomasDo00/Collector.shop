import { Knex } from 'knex';
import { logger } from '../../../core/logger/index.js';

/**
 * Seed categories table with test data
 */
export async function seed(knex: Knex): Promise<void> {
  // Clear existing data
  await knex('categories').del();

  // Insert test categories
  await knex('categories').insert([
    {
      id: '750e8400-e29b-41d4-a716-446655440001',
      name: 'Sneakers',
      slug: 'sneakers',
      description: 'Baskets limitées et sneakers rares',
      icon_url: '👟',
      product_count: 5,
      created_at: new Date('2024-01-01'),
      updated_at: new Date('2024-01-01'),
    },
    {
      id: '750e8400-e29b-41d4-a716-446655440002',
      name: 'Figurines',
      slug: 'figurines',
      description: 'Figurines de collection et statues',
      icon_url: '🗿',
      product_count: 2,
      created_at: new Date('2024-01-01'),
      updated_at: new Date('2024-01-01'),
    },
    {
      id: '750e8400-e29b-41d4-a716-446655440003',
      name: 'Vinyles',
      slug: 'vinyl',
      description: 'Disques vinyles vintage et neufs',
      icon_url: '💿',
      product_count: 2,
      created_at: new Date('2024-01-01'),
      updated_at: new Date('2024-01-01'),
    },
    {
      id: '750e8400-e29b-41d4-a716-446655440004',
      name: 'Posters',
      slug: 'posters',
      description: 'Posters signés et affiches vintage',
      icon_url: '🖼️',
      product_count: 2,
      created_at: new Date('2024-01-01'),
      updated_at: new Date('2024-01-01'),
    },
    {
      id: '750e8400-e29b-41d4-a716-446655440005',
      name: 'Cartes',
      slug: 'cards',
      description: 'Cartes Pokémon, Yu-Gi-Oh et autres',
      icon_url: '🃏',
      product_count: 2,
      created_at: new Date('2024-01-01'),
      updated_at: new Date('2024-01-01'),
    },
    {
      id: '750e8400-e29b-41d4-a716-446655440006',
      name: 'Montres',
      slug: 'watches',
      description: 'Montres de collection et éditions limitées',
      icon_url: '⌚',
      product_count: 1,
      created_at: new Date('2024-01-01'),
      updated_at: new Date('2024-01-01'),
    },
  ]);

  logger.info('✅ Categories seeded successfully');
}
