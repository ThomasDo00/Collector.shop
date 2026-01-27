import { Knex } from 'knex';
import bcrypt from 'bcrypt';
import { logger } from '../../../core/logger/index.js';
import { randomUUID } from 'crypto';

/**
 * Production seed - Adds more realistic data for demo/production
 * Run with: npm run seed
 */

// Helper to generate UUID
const uuid = () => randomUUID();

// Sample data arrays
const firstNames = [
  'Thomas', 'Emma', 'Lucas', 'Léa', 'Hugo', 'Chloé', 'Louis', 'Manon',
  'Gabriel', 'Inès', 'Raphaël', 'Jade', 'Arthur', 'Louise', 'Jules',
  'Alice', 'Adam', 'Lina', 'Maël', 'Rose', 'Nathan', 'Léna', 'Paul',
  'Mila', 'Théo', 'Anna', 'Ethan', 'Julia', 'Noah', 'Sarah'
];

const lastNames = [
  'Martin', 'Bernard', 'Thomas', 'Petit', 'Robert', 'Richard', 'Durand',
  'Dubois', 'Moreau', 'Laurent', 'Simon', 'Michel', 'Lefebvre', 'Leroy',
  'Roux', 'David', 'Bertrand', 'Morel', 'Fournier', 'Girard'
];

const cities = [
  'Paris', 'Lyon', 'Marseille', 'Toulouse', 'Nice', 'Nantes', 'Strasbourg',
  'Montpellier', 'Bordeaux', 'Lille', 'Rennes', 'Reims', 'Le Havre'
];

// Sneakers data
const sneakers = [
  { title: 'Nike Air Force 1 Low "White"', price: 120, condition: 'new' },
  { title: 'Adidas Yeezy Boost 350 V2 "Zebra"', price: 380, condition: 'new' },
  { title: 'New Balance 550 "White Green"', price: 160, condition: 'new' },
  { title: 'Nike Dunk Low "University Blue"', price: 220, condition: 'like_new' },
  { title: 'Jordan 4 Retro "Fire Red"', price: 320, condition: 'new' },
  { title: 'Nike Air Max 90 "Infrared"', price: 180, condition: 'very_good' },
  { title: 'Adidas Samba OG "White"', price: 110, condition: 'new' },
  { title: 'Nike SB Dunk Low "Travis Scott"', price: 1200, condition: 'new' },
  { title: 'Jordan 1 Low "Mocha"', price: 190, condition: 'like_new' },
  { title: 'New Balance 2002R "Protection Pack"', price: 200, condition: 'new' },
  { title: 'Nike Air Jordan 11 "Bred"', price: 280, condition: 'new' },
  { title: 'Adidas Forum Low "White"', price: 100, condition: 'new' },
  { title: 'Nike Blazer Mid 77 Vintage', price: 110, condition: 'new' },
  { title: 'Reebok Club C 85 Vintage', price: 90, condition: 'like_new' },
  { title: 'Converse Chuck 70 High', price: 95, condition: 'new' },
];

const figurines = [
  { title: 'Figurine Naruto Shippuden - Naruto Uzumaki', price: 85, condition: 'new' },
  { title: 'Statue Dragon Ball Z - Vegeta Final Flash', price: 320, condition: 'new' },
  { title: 'Figurine My Hero Academia - All Might', price: 150, condition: 'new' },
  { title: 'Pop! Funko Marvel - Spider-Man #1', price: 45, condition: 'like_new' },
  { title: 'Figurine Attack on Titan - Levi Ackerman', price: 180, condition: 'new' },
  { title: 'Statue One Punch Man - Saitama', price: 280, condition: 'new' },
  { title: 'Figurine Demon Slayer - Tanjiro', price: 120, condition: 'new' },
  { title: 'Pop! Funko Star Wars - Grogu', price: 25, condition: 'new' },
  { title: 'Figurine Jujutsu Kaisen - Gojo Satoru', price: 200, condition: 'new' },
  { title: 'Statue Final Fantasy VII - Cloud Strife', price: 450, condition: 'new' },
];

const vinyles = [
  { title: 'The Beatles - Abbey Road (Remaster)', price: 35, condition: 'new' },
  { title: 'Michael Jackson - Thriller', price: 28, condition: 'like_new' },
  { title: 'Nirvana - Nevermind', price: 32, condition: 'new' },
  { title: 'Queen - A Night at the Opera', price: 40, condition: 'very_good' },
  { title: 'David Bowie - The Rise and Fall of Ziggy Stardust', price: 38, condition: 'new' },
  { title: 'Fleetwood Mac - Rumours', price: 35, condition: 'like_new' },
  { title: 'Led Zeppelin - IV', price: 42, condition: 'new' },
  { title: 'The Dark Side of the Moon - Pink Floyd', price: 45, condition: 'new' },
  { title: 'Kendrick Lamar - To Pimp a Butterfly', price: 38, condition: 'new' },
  { title: 'Radiohead - OK Computer', price: 40, condition: 'new' },
];

const posters = [
  { title: 'Affiche Originale - Blade Runner (1982)', price: 350, condition: 'good' },
  { title: 'Poster Signé - The Matrix', price: 280, condition: 'very_good' },
  { title: 'Affiche Cinéma - Inception', price: 120, condition: 'like_new' },
  { title: 'Poster Vintage - E.T.', price: 200, condition: 'good' },
  { title: 'Affiche Collector - Interstellar', price: 150, condition: 'new' },
  { title: 'Poster Art - Studio Ghibli Collection', price: 90, condition: 'new' },
  { title: 'Affiche - Akira (1988)', price: 180, condition: 'very_good' },
  { title: 'Poster Numéroté - Dune (2021)', price: 250, condition: 'new' },
];

const cards = [
  { title: 'Carte Pokémon - Pikachu Illustrator (Replica)', price: 150, condition: 'new' },
  { title: 'Lot 50 Cartes Pokémon Vintage', price: 80, condition: 'very_good' },
  { title: 'Carte Magic - Black Lotus (Proxy)', price: 45, condition: 'new' },
  { title: 'Booster Pokémon Première Édition Scellé', price: 500, condition: 'new' },
  { title: 'Collection Yu-Gi-Oh! - Deck Complet', price: 120, condition: 'like_new' },
  { title: 'Carte One Piece - Luffy Gear 5 SP', price: 85, condition: 'new' },
  { title: 'Lot Cartes Dragon Ball Super', price: 60, condition: 'new' },
  { title: 'Carte PSA 10 - Charizard Holo', price: 800, condition: 'new' },
];

const watches = [
  { title: 'Casio G-Shock DW-5600', price: 120, condition: 'new' },
  { title: 'Seiko 5 Sports Automatique', price: 280, condition: 'new' },
  { title: 'Swatch x Omega MoonSwatch', price: 450, condition: 'new' },
  { title: 'Casio Vintage A168WA', price: 35, condition: 'new' },
  { title: 'Orient Bambino Automatique', price: 220, condition: 'like_new' },
  { title: 'Timex Q Reissue', price: 180, condition: 'new' },
];

const reviewTexts = [
  'Excellent vendeur, produit conforme à la description. Livraison rapide !',
  'Très satisfait de mon achat. Communication parfaite.',
  'Produit authentique, emballage soigné. Je recommande !',
  'Transaction impeccable, vendeur sérieux.',
  'Super qualité, exactement comme sur les photos.',
  'Vendeur réactif et professionnel. Merci !',
  'Parfait état, livré rapidement. Top !',
  'Conforme aux attentes, bon rapport qualité-prix.',
  'Excellente expérience, je reviendrai !',
  'Très bon produit, vendeur de confiance.',
];

export async function seed(knex: Knex): Promise<void> {
  // Check if we should run (avoid duplicating data)
  const existingUsers = await knex('users').count('id as count').first();
  if (existingUsers && Number(existingUsers.count) > 10) {
    logger.info('⏭️  Production data already seeded, skipping...');
    return;
  }

  logger.info('🌱 Starting production seed...');

  const passwordHash = await bcrypt.hash('Collector2024!', 12);

  // Create additional sellers
  const sellers: Array<{
    id: string;
    email: string;
    username: string;
    password_hash: string;
    role: string;
    status: string;
    first_name: string;
    last_name: string;
    avatar_url: string;
    bio: string;
    location: string;
    created_at: Date;
    updated_at: Date;
  }> = [];

  for (let i = 0; i < 15; i++) {
    const firstName = firstNames[i % firstNames.length];
    const lastName = lastNames[i % lastNames.length];
    const city = cities[i % cities.length];

    sellers.push({
      id: uuid(),
      email: `seller${i + 10}@collector.shop`,
      username: `${firstName.toLowerCase()}_collector${i}`,
      password_hash: passwordHash,
      role: 'seller',
      status: 'active',
      first_name: firstName,
      last_name: lastName,
      avatar_url: `https://i.pravatar.cc/150?img=${10 + i}`,
      bio: `Passionné de collection depuis ${2015 + (i % 8)} ans. Basé à ${city}.`,
      location: `${city}, France`,
      created_at: new Date(2023, i % 12, 1 + (i % 28)),
      updated_at: new Date(),
    });
  }

  // Create additional buyers
  const buyers: Array<{
    id: string;
    email: string;
    username: string;
    password_hash: string;
    role: string;
    status: string;
    first_name: string;
    last_name: string;
    avatar_url: string;
    created_at: Date;
    updated_at: Date;
  }> = [];

  for (let i = 0; i < 20; i++) {
    const firstName = firstNames[(i + 15) % firstNames.length];
    const lastName = lastNames[(i + 10) % lastNames.length];

    buyers.push({
      id: uuid(),
      email: `buyer${i + 10}@collector.shop`,
      username: `${firstName.toLowerCase()}_${lastName.toLowerCase()}${i}`,
      password_hash: passwordHash,
      role: 'buyer',
      status: 'active',
      first_name: firstName,
      last_name: lastName,
      avatar_url: `https://i.pravatar.cc/150?img=${30 + i}`,
      created_at: new Date(2024, i % 12, 1 + (i % 28)),
      updated_at: new Date(),
    });
  }

  await knex('users').insert([...sellers, ...buyers]);
  logger.info(`✅ Created ${sellers.length} sellers and ${buyers.length} buyers`);

  // Get category IDs
  const categories = await knex('categories').select('id', 'slug', 'name');
  const categoryMap = Object.fromEntries(categories.map(c => [c.slug, { id: c.id, name: c.name }]));

  // Create products
  const products: Array<{
    id: string;
    title: string;
    description: string;
    price: number;
    image_url: string;
    category_id: string;
    category_name: string;
    condition: string;
    status: string;
    seller_id: string;
    created_at: Date;
    updated_at: Date;
  }> = [];

  const productData = [
    { items: sneakers, categorySlug: 'sneakers', images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
      'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=400',
      'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=400',
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400',
    ]},
    { items: figurines, categorySlug: 'figurines', images: [
      'https://images.unsplash.com/photo-1608889825103-eb5ed706fc64?w=400',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
    ]},
    { items: vinyles, categorySlug: 'vinyl', images: [
      'https://images.unsplash.com/photo-1539375665275-f9de415ef9ac?w=400',
      'https://images.unsplash.com/photo-1483412033650-1015ddeb83d1?w=400',
    ]},
    { items: posters, categorySlug: 'posters', images: [
      'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400',
      'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=400',
    ]},
    { items: cards, categorySlug: 'cards', images: [
      'https://images.unsplash.com/photo-1606503153255-59d7e10e6b5e?w=400',
      'https://images.unsplash.com/photo-1613771404784-3a5686aa2be3?w=400',
    ]},
    { items: watches, categorySlug: 'watches', images: [
      'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400',
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
    ]},
  ];

  for (const { items, categorySlug, images } of productData) {
    const category = categoryMap[categorySlug];
    if (!category) continue;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const seller = sellers[i % sellers.length];
      const daysAgo = Math.floor(Math.random() * 90);

      products.push({
        id: uuid(),
        title: item.title,
        description: `${item.title} - Article de collection en ${
          item.condition === 'new' ? 'parfait état, neuf' :
          item.condition === 'like_new' ? 'excellent état, comme neuf' :
          item.condition === 'very_good' ? 'très bon état' : 'bon état'
        }. Authenticité garantie.`,
        price: item.price,
        image_url: images[i % images.length],
        category_id: category.id,
        category_name: category.name,
        condition: item.condition,
        status: Math.random() > 0.1 ? 'active' : (Math.random() > 0.5 ? 'sold' : 'reserved'),
        seller_id: seller.id,
        created_at: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
        updated_at: new Date(),
      });
    }
  }

  await knex('products').insert(products);
  logger.info(`✅ Created ${products.length} products`);

  // Update category product counts
  for (const category of categories) {
    const count = await knex('products')
      .where('category_id', category.id)
      .where('status', 'active')
      .count('id as count')
      .first();

    await knex('categories')
      .where('id', category.id)
      .update({ product_count: Number(count?.count || 0) });
  }

  // Create reviews for sold products
  const soldProducts = products.filter(p => p.status === 'sold');
  const reviews: Array<{
    id: string;
    product_id: string;
    reviewer_id: string;
    seller_id: string;
    rating: number;
    comment: string;
    created_at: Date;
  }> = [];

  for (const product of soldProducts) {
    const buyer = buyers[Math.floor(Math.random() * buyers.length)];
    reviews.push({
      id: uuid(),
      product_id: product.id,
      reviewer_id: buyer.id,
      seller_id: product.seller_id,
      rating: Math.floor(Math.random() * 2) + 4, // 4 or 5 stars
      comment: reviewTexts[Math.floor(Math.random() * reviewTexts.length)],
      created_at: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
    });
  }

  if (reviews.length > 0) {
    await knex('reviews').insert(reviews);
    logger.info(`✅ Created ${reviews.length} reviews`);
  }

  logger.info('🎉 Production seed completed!');
  logger.info('📧 Test accounts: seller10@collector.shop / Collector2024!');
}
