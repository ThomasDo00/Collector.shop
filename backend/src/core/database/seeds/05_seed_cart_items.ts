import type { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Delete existing cart items
  await knex('cart_items').del();

  // Add Nike Air Max 1 "Patta" to buyer1's cart
  await knex('cart_items').insert([
    {
      id: 'a50e8400-e29b-41d4-a716-446655440001',
      user_id: '550e8400-e29b-41d4-a716-446655440001', // buyer1 (sneaker_hunter)
      product_id: '850e8400-e29b-41d4-a716-446655440001', // Nike Air Max 1 "Patta"
      quantity: 1,
      created_at: new Date('2024-01-20'),
      updated_at: new Date('2024-01-20'),
    },
  ]);
}
