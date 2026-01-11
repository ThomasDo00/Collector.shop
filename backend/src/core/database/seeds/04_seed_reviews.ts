import type { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Delete existing reviews
  await knex('reviews').del();

  // Insert reviews for sneakerhead42 (seller_id: ...440002 - vintage_collector)
  await knex('reviews').insert([
    {
      id: '950e8400-e29b-41d4-a716-446655440001',
      seller_id: '550e8400-e29b-41d4-a716-446655440002', // vintage_collector
      buyer_id: '550e8400-e29b-41d4-a716-446655440001', // buyer1
      product_id: '850e8400-e29b-41d4-a716-446655440001', // Nike Air Max 1 "Patta"
      rating: 5,
      comment: 'Vendeur tres serieux, envoi rapide et bien emballe. La paire correspond parfaitement a la description. Je recommande !',
      created_at: new Date('2024-01-10'),
      updated_at: new Date('2024-01-10'),
    },
    {
      id: '950e8400-e29b-41d4-a716-446655440002',
      seller_id: '550e8400-e29b-41d4-a716-446655440002', // vintage_collector
      buyer_id: '550e8400-e29b-41d4-a716-446655440003', // seller1
      product_id: '850e8400-e29b-41d4-a716-446655440002', // Funko Pop Star Wars
      rating: 5,
      comment: 'Excellente transaction, communication fluide et produit authentique. Merci !',
      created_at: new Date('2024-01-05'),
      updated_at: new Date('2024-01-05'),
    },
    {
      id: '950e8400-e29b-41d4-a716-446655440003',
      seller_id: '550e8400-e29b-41d4-a716-446655440002', // vintage_collector
      buyer_id: '550e8400-e29b-41d4-a716-446655440004', // seller2
      product_id: '850e8400-e29b-41d4-a716-446655440003', // Vinyle Beatles
      rating: 4,
      comment: 'Bonne transaction dans l\'ensemble. Delai d\'envoi un peu long mais produit conforme.',
      created_at: new Date('2023-12-28'),
      updated_at: new Date('2023-12-28'),
    },
    {
      id: '950e8400-e29b-41d4-a716-446655440004',
      seller_id: '550e8400-e29b-41d4-a716-446655440002', // vintage_collector
      buyer_id: '550e8400-e29b-41d4-a716-446655440005', // buyer2
      rating: 5,
      comment: 'Parfait ! Article conforme, emballage soigne. Vendeur a l\'ecoute.',
      created_at: new Date('2023-12-15'),
      updated_at: new Date('2023-12-15'),
    },
  ]);
}
