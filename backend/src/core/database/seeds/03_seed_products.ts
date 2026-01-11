import { Knex } from 'knex';

/**
 * Seed products table with test data
 * Uses the users and categories created in previous seeds
 */
export async function seed(knex: Knex): Promise<void> {
  // Clear existing data
  await knex('products').del();

  // Insert test products
  await knex('products').insert([
    {
      id: '850e8400-e29b-41d4-a716-446655440001',
      title: 'Nike Air Max 1 "Patta"',
      description: 'Collaboration exclusive Nike x Patta. État neuf avec boîte d\'origine.',
      price: 450.00,
      image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
      category_id: '750e8400-e29b-41d4-a716-446655440001', // Sneakers
      category_name: 'Sneakers',
      condition: 'new',
      status: 'active',
      seller_id: '550e8400-e29b-41d4-a716-446655440002', // vintage_collector (seller)
      created_at: new Date('2024-01-15'),
      updated_at: new Date('2024-01-15'),
    },
    {
      id: '850e8400-e29b-41d4-a716-446655440002',
      title: 'Figurine Dragon Ball Z Goku Ultra Instinct',
      description: 'Figurine officielle Bandai, édition limitée.',
      price: 180.00,
      image_url: 'https://images.unsplash.com/photo-1608889825103-eb5ed706fc64?w=400',
      category_id: '750e8400-e29b-41d4-a716-446655440002', // Figurines
      category_name: 'Figurines',
      condition: 'new',
      status: 'active',
      seller_id: '550e8400-e29b-41d4-a716-446655440005', // retro_gamer (seller)
      created_at: new Date('2024-01-14'),
      updated_at: new Date('2024-01-14'),
    },
    {
      id: '850e8400-e29b-41d4-a716-446655440003',
      title: 'Vinyle Pink Floyd - The Wall Édition Limitée',
      description: 'Pressage audiophile 180g, pochette gatefold.',
      price: 75.00,
      image_url: 'https://images.unsplash.com/photo-1539375665275-f9de415ef9ac?w=400',
      category_id: '750e8400-e29b-41d4-a716-446655440003', // Vinyles
      category_name: 'Vinyles',
      condition: 'like_new',
      status: 'active',
      seller_id: '550e8400-e29b-41d4-a716-446655440002',
      created_at: new Date('2024-01-13'),
      updated_at: new Date('2024-01-13'),
    },
    {
      id: '850e8400-e29b-41d4-a716-446655440004',
      title: 'Poster Star Wars Original 1977',
      description: 'Affiche originale de cinéma, édition américaine.',
      price: 220.00,
      image_url: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400',
      category_id: '750e8400-e29b-41d4-a716-446655440004', // Posters
      category_name: 'Posters',
      condition: 'good',
      status: 'active',
      seller_id: '550e8400-e29b-41d4-a716-446655440005',
      created_at: new Date('2024-01-12'),
      updated_at: new Date('2024-01-12'),
    },
    {
      id: '850e8400-e29b-41d4-a716-446655440005',
      title: 'Nike Dunk Low "Panda"',
      description: 'Coloris iconique noir et blanc, état impeccable.',
      price: 180.00,
      image_url: 'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=400',
      category_id: '750e8400-e29b-41d4-a716-446655440001',
      category_name: 'Sneakers',
      condition: 'new',
      status: 'active',
      seller_id: '550e8400-e29b-41d4-a716-446655440002',
      created_at: new Date('2024-01-11'),
      updated_at: new Date('2024-01-11'),
    },
    {
      id: '850e8400-e29b-41d4-a716-446655440006',
      title: 'Carte Pokémon Dracaufeu Holographique 1ère Édition',
      description: 'Carte française en excellent état, protégée sous sleeve.',
      price: 1500.00,
      image_url: 'https://images.unsplash.com/photo-1606503153255-59d7e10e6b5e?w=400',
      category_id: '750e8400-e29b-41d4-a716-446655440005', // Cartes
      category_name: 'Cartes',
      condition: 'very_good',
      status: 'active',
      seller_id: '550e8400-e29b-41d4-a716-446655440005',
      created_at: new Date('2024-01-10'),
      updated_at: new Date('2024-01-10'),
    },
    {
      id: '850e8400-e29b-41d4-a716-446655440007',
      title: 'Montre Casio G-Shock x A Bathing Ape',
      description: 'Collaboration limitée BAPE x Casio, jamais portée.',
      price: 350.00,
      image_url: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400',
      category_id: '750e8400-e29b-41d4-a716-446655440006', // Montres
      category_name: 'Montres',
      condition: 'new',
      status: 'active',
      seller_id: '550e8400-e29b-41d4-a716-446655440002',
      created_at: new Date('2024-01-09'),
      updated_at: new Date('2024-01-09'),
    },
    {
      id: '850e8400-e29b-41d4-a716-446655440008',
      title: 'Figurine One Piece Luffy Gear 5',
      description: 'Figurine officielle de la dernière transformation de Luffy.',
      price: 250.00,
      image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
      category_id: '750e8400-e29b-41d4-a716-446655440002',
      category_name: 'Figurines',
      condition: 'new',
      status: 'active',
      seller_id: '550e8400-e29b-41d4-a716-446655440005',
      created_at: new Date('2024-01-08'),
      updated_at: new Date('2024-01-08'),
    },
    {
      id: '850e8400-e29b-41d4-a716-446655440009',
      title: 'Vinyle Daft Punk - Random Access Memories',
      description: 'Album légendaire en vinyle, pochette deluxe.',
      price: 55.00,
      image_url: 'https://images.unsplash.com/photo-1483412033650-1015ddeb83d1?w=400',
      category_id: '750e8400-e29b-41d4-a716-446655440003',
      category_name: 'Vinyles',
      condition: 'like_new',
      status: 'reserved',
      seller_id: '550e8400-e29b-41d4-a716-446655440002',
      created_at: new Date('2024-01-07'),
      updated_at: new Date('2024-01-07'),
    },
    {
      id: '850e8400-e29b-41d4-a716-446655440010',
      title: 'Poster Pulp Fiction Original Cinéma',
      description: 'Affiche française originale de cinéma.',
      price: 180.00,
      image_url: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=400',
      category_id: '750e8400-e29b-41d4-a716-446655440004',
      category_name: 'Posters',
      condition: 'good',
      status: 'active',
      seller_id: '550e8400-e29b-41d4-a716-446655440005',
      created_at: new Date('2024-01-06'),
      updated_at: new Date('2024-01-06'),
    },
    {
      id: '850e8400-e29b-41d4-a716-446655440011',
      title: 'Nike Air Jordan 1 "Chicago" 2015',
      description: 'Paire iconique dans un très bon état général.',
      price: 850.00,
      original_price: 950.00,
      image_url: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=400',
      category_id: '750e8400-e29b-41d4-a716-446655440001',
      category_name: 'Sneakers',
      condition: 'very_good',
      status: 'sold',
      seller_id: '550e8400-e29b-41d4-a716-446655440002',
      created_at: new Date('2024-01-05'),
      updated_at: new Date('2024-01-05'),
    },
    {
      id: '850e8400-e29b-41d4-a716-446655440012',
      title: 'Carte Yu-Gi-Oh Dragon Blanc aux Yeux Bleus',
      description: 'Carte rare en très bon état, collection personnelle.',
      price: 380.00,
      image_url: 'https://images.unsplash.com/photo-1613771404784-3a5686aa2be3?w=400',
      category_id: '750e8400-e29b-41d4-a716-446655440005',
      category_name: 'Cartes',
      condition: 'like_new',
      status: 'active',
      seller_id: '550e8400-e29b-41d4-a716-446655440002',
      created_at: new Date('2024-01-04'),
      updated_at: new Date('2024-01-04'),
    },
  ]);

  console.log('✅ Products seeded successfully');
  console.log('📦 12 products created across 6 categories');
}
