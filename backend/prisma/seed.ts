/**
 * Database Seed Script
 *
 * Populates categories, products, banners, and the admin user.
 * Run with: npx ts-node prisma/seed.ts
 */

import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const ADMIN_PHONE = '9000000000';
const ADMIN_PASSWORD = 'Admin@123456';
const ADMIN_NAME = 'Vrindavan Mart Admin';

async function main() {
  console.log('🌱 Starting database seed...');

  // 1. Seed Admin User
  const existingAdmin = await prisma.user.findUnique({
    where: { phone: ADMIN_PHONE },
  });

  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
    await prisma.user.create({
      data: {
        phone: ADMIN_PHONE,
        name: ADMIN_NAME,
        passwordHash,
        role: Role.ADMIN,
        isActive: true,
      },
    });
    console.log('✅ Admin user seeded.');
  } else {
    console.log('ℹ️ Admin user already exists. Skipping user creation.');
  }

  // 2. Clean existing catalog data
  console.log('🧹 Cleaning existing catalog data...');
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.banner.deleteMany();

  // 3. Seed Categories
  console.log('📦 Seeding categories...');
  const categoriesData = [
    { id: 1, name: 'Fruits & Vegetables', slug: 'fruits-vegetables', icon: 'fa-carrot', sortOrder: 1 },
    { id: 2, name: 'Dairy & Eggs', slug: 'dairy-eggs', icon: 'fa-egg', sortOrder: 2 },
    { id: 3, name: 'Bakery', slug: 'bakery', icon: 'fa-bread-slice', sortOrder: 3 },
    { id: 4, name: 'Beverages', slug: 'beverages', icon: 'fa-mug-hot', sortOrder: 4 },
    { id: 5, name: 'Snacks', slug: 'snacks', icon: 'fa-cookie-bite', sortOrder: 5 },
    { id: 6, name: 'Staples & Grains', slug: 'staples-grains', icon: 'fa-wheat-awn', sortOrder: 6 },
    { id: 7, name: 'Meat & Seafood', slug: 'meat-seafood', icon: 'fa-fish', sortOrder: 7 },
    { id: 8, name: 'Personal Care', slug: 'personal-care', icon: 'fa-pump-soap', sortOrder: 8 },
    { id: 9, name: 'Household', slug: 'household', icon: 'fa-broom', sortOrder: 9 },
    { id: 10, name: 'Frozen Foods', slug: 'frozen-foods', icon: 'fa-snowflake', sortOrder: 10 },
  ];

  const categoryIds = new Map<number, number>();
  for (const { id: seedId, ...category } of categoriesData) {
    const createdCategory = await prisma.category.create({ data: category });
    categoryIds.set(seedId, createdCategory.id);
  }
  console.log('✅ Categories seeded.');

  // 4. Seed Products
  console.log('🛒 Seeding products...');
  const productsData = [
    // Fruits & Vegetables (categoryId: 1)
    { categoryId: 1, name: 'Fresh Bananas', slug: 'fresh-bananas', description: 'Naturally ripened, sweet and fresh bananas sourced from local farms.', price: 39, mrp: 49, unit: '1 dozen', image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=500', stock: 120, rating: 4.5, ratingCount: 320, isFeatured: true },
    { categoryId: 1, name: 'Red Apples', slug: 'red-apples', description: 'Crisp and juicy red apples, rich in fiber and antioxidants.', price: 149, mrp: 179, unit: '1 kg', image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500', stock: 90, rating: 4.6, ratingCount: 210, isFeatured: true },
    { categoryId: 1, name: 'Fresh Tomatoes', slug: 'fresh-tomatoes', description: 'Farm-fresh red tomatoes, perfect for curries and salads.', price: 29, mrp: 40, unit: '1 kg', image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500', stock: 150, rating: 4.2, ratingCount: 180, isFeatured: false },
    { categoryId: 1, name: 'Potatoes', slug: 'potatoes', description: 'Premium quality potatoes, great for all your cooking needs.', price: 25, mrp: 35, unit: '1 kg', image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=500', stock: 200, rating: 4.3, ratingCount: 150, isFeatured: false },
    { categoryId: 1, name: 'Onions', slug: 'onions', description: 'Fresh red onions with strong flavor, a kitchen essential.', price: 32, mrp: 45, unit: '1 kg', image: 'https://images.unsplash.com/photo-1618512496248-a3c25c2f2b8e?w=500', stock: 200, rating: 4.1, ratingCount: 140, isFeatured: false },
    { categoryId: 1, name: 'Green Capsicum', slug: 'green-capsicum', description: 'Crunchy and fresh green bell peppers.', price: 45, mrp: 60, unit: '500 g', image: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=500', stock: 80, rating: 4.0, ratingCount: 60, isFeatured: false },
    { categoryId: 1, name: 'Spinach Bunch', slug: 'spinach-bunch', description: 'Fresh green spinach leaves, packed with iron.', price: 20, mrp: 25, unit: '1 bunch', image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=500', stock: 70, rating: 4.4, ratingCount: 90, isFeatured: false },
    { categoryId: 1, name: 'Carrots', slug: 'carrots', description: 'Sweet and crunchy orange carrots.', price: 35, mrp: 45, unit: '500 g', image: 'https://images.unsplash.com/photo-1447175008436-054170c2e979?w=500', stock: 90, rating: 4.3, ratingCount: 75, isFeatured: false },

    // Dairy & Eggs (categoryId: 2)
    { categoryId: 2, name: 'Full Cream Milk', slug: 'full-cream-milk', description: 'Pasteurized full cream milk, rich in calcium and protein.', price: 62, mrp: 68, unit: '1 L', image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500', stock: 100, rating: 4.7, ratingCount: 400, isFeatured: true },
    { categoryId: 2, name: 'Farm Eggs', slug: 'farm-eggs', description: 'Fresh brown eggs from free-range hens.', price: 78, mrp: 90, unit: '12 pcs', image: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=500', stock: 100, rating: 4.6, ratingCount: 260, isFeatured: true },
    { categoryId: 2, name: 'Greek Yogurt', slug: 'greek-yogurt', description: 'Thick and creamy greek style yogurt.', price: 55, mrp: 65, unit: '400 g', image: 'https://images.unsplash.com/photo-1571212515416-fca988083f43?w=500', stock: 60, rating: 4.5, ratingCount: 130, isFeatured: false },
    { categoryId: 2, name: 'Butter', slug: 'butter', description: 'Creamy salted butter made from fresh milk.', price: 52, mrp: 58, unit: '100 g', image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=500', stock: 80, rating: 4.4, ratingCount: 95, isFeatured: false },
    { categoryId: 2, name: 'Cheese Slices', slug: 'cheese-slices', description: 'Delicious processed cheese slices for sandwiches.', price: 120, mrp: 140, unit: '200 g', image: 'https://images.unsplash.com/photo-1618164436241-4473940d1f5c?w=500', stock: 70, rating: 4.3, ratingCount: 88, isFeatured: false },
    { categoryId: 2, name: 'Paneer', slug: 'paneer', description: 'Fresh soft cottage cheese, high in protein.', price: 90, mrp: 100, unit: '200 g', image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500', stock: 65, rating: 4.6, ratingCount: 150, isFeatured: false },

    // Bakery (categoryId: 3)
    { categoryId: 3, name: 'Whole Wheat Bread', slug: 'whole-wheat-bread', description: 'Soft and healthy whole wheat bread loaf.', price: 45, mrp: 50, unit: '400 g', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500', stock: 60, rating: 4.4, ratingCount: 120, isFeatured: true },
    { categoryId: 3, name: 'Croissants', slug: 'croissants', description: 'Buttery and flaky French croissants, pack of 4.', price: 99, mrp: 120, unit: '4 pcs', image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500', stock: 40, rating: 4.5, ratingCount: 70, isFeatured: false },
    { categoryId: 3, name: 'Chocolate Muffins', slug: 'chocolate-muffins', description: 'Rich chocolate muffins, pack of 6.', price: 129, mrp: 150, unit: '6 pcs', image: 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=500', stock: 35, rating: 4.3, ratingCount: 55, isFeatured: false },
    { categoryId: 3, name: 'Burger Buns', slug: 'burger-buns', description: 'Soft sesame burger buns, pack of 6.', price: 60, mrp: 70, unit: '6 pcs', image: 'https://images.unsplash.com/photo-1584736286279-11c8f11b7ca4?w=500', stock: 45, rating: 4.2, ratingCount: 40, isFeatured: false },

    // Beverages (categoryId: 4)
    { categoryId: 4, name: 'Orange Juice', slug: 'orange-juice', description: '100% natural orange juice, no added sugar.', price: 110, mrp: 130, unit: '1 L', image: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=500', stock: 55, rating: 4.5, ratingCount: 100, isFeatured: true },
    { categoryId: 4, name: 'Green Tea', slug: 'green-tea', description: 'Antioxidant rich green tea bags, pack of 25.', price: 180, mrp: 220, unit: '25 bags', image: 'https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5?w=500', stock: 50, rating: 4.4, ratingCount: 80, isFeatured: false },
    { categoryId: 4, name: 'Cola Soft Drink', slug: 'cola-soft-drink', description: 'Chilled and fizzy cola soft drink.', price: 40, mrp: 45, unit: '750 ml', image: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=500', stock: 100, rating: 4.1, ratingCount: 200, isFeatured: false },
    { categoryId: 4, name: 'Instant Coffee', slug: 'instant-coffee', description: 'Rich and aromatic instant coffee powder.', price: 210, mrp: 250, unit: '200 g', image: 'https://images.unsplash.com/photo-1610889556528-9a770e32642f?w=500', stock: 45, rating: 4.6, ratingCount: 160, isFeatured: true },
    { categoryId: 4, name: 'Mineral Water', slug: 'mineral-water', description: 'Pure and safe packaged drinking water.', price: 20, mrp: 25, unit: '1 L', image: 'https://images.unsplash.com/photo-1560023907-5f339617ea30?w=500', stock: 200, rating: 4.3, ratingCount: 90, isFeatured: false },

    // Snacks (categoryId: 5)
    { categoryId: 5, name: 'Potato Chips', slug: 'potato-chips', description: 'Crispy salted potato chips.', price: 30, mrp: 35, unit: '90 g', image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=500', stock: 120, rating: 4.2, ratingCount: 210, isFeatured: true },
    { categoryId: 5, name: 'Mixed Nuts', slug: 'mixed-nuts', description: 'Premium roasted mixed nuts, healthy snacking.', price: 250, mrp: 300, unit: '250 g', image: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=500', stock: 40, rating: 4.7, ratingCount: 130, isFeatured: true },
    { categoryId: 5, name: 'Chocolate Cookies', slug: 'chocolate-cookies', description: 'Crunchy chocolate chip cookies.', price: 55, mrp: 65, unit: '200 g', image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=500', stock: 90, rating: 4.4, ratingCount: 150, isFeatured: false },
    { categoryId: 5, name: 'Popcorn', slug: 'popcorn', description: 'Butter flavored ready-to-eat popcorn.', price: 45, mrp: 55, unit: '150 g', image: 'https://images.unsplash.com/photo-1578849278619-e73505e9610f?w=500', stock: 70, rating: 4.1, ratingCount: 60, isFeatured: false },

    // Staples & Grains (categoryId: 6)
    { categoryId: 6, name: 'Basmati Rice', slug: 'basmati-rice', description: 'Premium long grain basmati rice.', price: 180, mrp: 210, unit: '5 kg', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500', stock: 60, rating: 4.6, ratingCount: 220, isFeatured: true },
    { categoryId: 6, name: 'Whole Wheat Atta', slug: 'whole-wheat-atta', description: 'Stone ground whole wheat flour.', price: 220, mrp: 250, unit: '5 kg', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500', stock: 55, rating: 4.5, ratingCount: 190, isFeatured: true },
    { categoryId: 6, name: 'Toor Dal', slug: 'toor-dal', description: 'Premium quality split pigeon peas.', price: 140, mrp: 160, unit: '1 kg', image: 'https://images.unsplash.com/photo-1585059895524-72359e06133a?w=500', stock: 70, rating: 4.4, ratingCount: 110, isFeatured: false },
    { categoryId: 6, name: 'Sunflower Oil', slug: 'sunflower-oil', description: 'Refined sunflower cooking oil.', price: 165, mrp: 185, unit: '1 L', image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500', stock: 80, rating: 4.3, ratingCount: 140, isFeatured: false },
    { categoryId: 6, name: 'Sugar', slug: 'sugar', description: 'Pure refined white sugar.', price: 48, mrp: 55, unit: '1 kg', image: 'https://images.unsplash.com/photo-1581441363689-94db8f2b52e2?w=500', stock: 100, rating: 4.2, ratingCount: 90, isFeatured: false },

    // Meat & Seafood (categoryId: 7)
    { categoryId: 7, name: 'Chicken Breast', slug: 'chicken-breast', description: 'Fresh boneless chicken breast.', price: 220, mrp: 250, unit: '500 g', image: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=500', stock: 40, rating: 4.5, ratingCount: 120, isFeatured: true },
    { categoryId: 7, name: 'Fresh Prawns', slug: 'fresh-prawns', description: 'Cleaned and deveined fresh prawns.', price: 380, mrp: 420, unit: '500 g', image: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=500', stock: 25, rating: 4.6, ratingCount: 70, isFeatured: false },
    { categoryId: 7, name: 'Mutton Curry Cut', slug: 'mutton-curry-cut', description: 'Fresh mutton curry cut pieces.', price: 480, mrp: 520, unit: '500 g', image: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=500', stock: 20, rating: 4.4, ratingCount: 55, isFeatured: false },

    // Personal Care (categoryId: 8)
    { categoryId: 8, name: 'Shampoo', slug: 'shampoo', description: 'Nourishing shampoo for all hair types.', price: 199, mrp: 230, unit: '340 ml', image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500', stock: 50, rating: 4.3, ratingCount: 95, isFeatured: false },
    { categoryId: 8, name: 'Body Wash', slug: 'body-wash', description: 'Refreshing moisturizing body wash.', price: 175, mrp: 199, unit: '250 ml', image: 'https://images.unsplash.com/photo-1585232004423-42d9d1d6b6c9?w=500', stock: 45, rating: 4.2, ratingCount: 65, isFeatured: false },
    { categoryId: 8, name: 'Toothpaste', slug: 'toothpaste', description: 'Cavity protection toothpaste with fluoride.', price: 55, mrp: 65, unit: '150 g', image: 'https://images.unsplash.com/photo-1559591935-c6c92c6d7ea1?w=500', stock: 90, rating: 4.4, ratingCount: 130, isFeatured: false },

    // Household (categoryId: 9)
    { categoryId: 9, name: 'Dish Wash Liquid', slug: 'dish-wash-liquid', description: 'Effective grease removing dish wash liquid.', price: 99, mrp: 115, unit: '500 ml', image: 'https://images.unsplash.com/photo-1585421514738-01798e348b17?w=500', stock: 60, rating: 4.3, ratingCount: 80, isFeatured: false },
    { categoryId: 9, name: 'Laundry Detergent', slug: 'laundry-detergent', description: 'Powerful stain removing laundry detergent powder.', price: 220, mrp: 250, unit: '1 kg', image: 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=500', stock: 40, rating: 4.4, ratingCount: 100, isFeatured: false },
    { categoryId: 9, name: 'Tissue Paper Rolls', slug: 'tissue-paper-rolls', description: 'Soft and strong tissue paper rolls, pack of 4.', price: 150, mrp: 175, unit: '4 rolls', image: 'https://images.unsplash.com/photo-1584556812952-905ffd0c611a?w=500', stock: 55, rating: 4.2, ratingCount: 45, isFeatured: false },

    // Frozen Foods (categoryId: 10)
    { categoryId: 10, name: 'Frozen Peas', slug: 'frozen-peas', description: 'Farm fresh frozen green peas.', price: 65, mrp: 75, unit: '500 g', image: 'https://images.unsplash.com/photo-1587735243615-c03f25aaff15?w=500', stock: 50, rating: 4.3, ratingCount: 60, isFeatured: false },
    { categoryId: 10, name: 'Frozen French Fries', slug: 'frozen-french-fries', description: 'Crispy golden frozen french fries.', price: 110, mrp: 130, unit: '750 g', image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500', stock: 45, rating: 4.5, ratingCount: 85, isFeatured: true },
    { categoryId: 10, name: 'Veg Momos', slug: 'veg-momos', description: 'Ready-to-steam vegetable momos.', price: 140, mrp: 160, unit: '400 g', image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=500', stock: 35, rating: 4.4, ratingCount: 50, isFeatured: false },
  ];

  for (const prod of productsData) {
    const createdProd = await prisma.product.create({
      data: {
        ...prod,
        categoryId: categoryIds.get(prod.categoryId)!,
      },
    });

    // Seed some gallery images for specific products
    if (prod.slug === 'fresh-bananas') {
      await prisma.productImage.createMany({
        data: [
          { productId: createdProd.id, url: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=800', sortOrder: 1 },
          { productId: createdProd.id, url: 'https://images.unsplash.com/photo-1543218024-57a70143c369?w=800', sortOrder: 2 },
        ],
      });
    } else if (prod.slug === 'red-apples') {
      await prisma.productImage.createMany({
        data: [
          { productId: createdProd.id, url: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=800', sortOrder: 1 },
          { productId: createdProd.id, url: 'https://images.unsplash.com/photo-1579613832125-5d34a13ff2a8?w=800', sortOrder: 2 },
        ],
      });
    }
  }
  console.log('✅ Products seeded.');

  // 5. Seed Banners
  console.log('🎟️ Seeding banners...');
  const bannersData = [
    {
      title: 'Fresh Fruits & Veggies',
      subtitle: 'Get up to 30% OFF daily essentials',
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1000',
      ctaText: 'Shop Now',
      ctaLink: '/categories/fruits-vegetables',
      isActive: true,
      sortOrder: 1,
    },
    {
      title: 'Dairy & Breakfast',
      subtitle: 'Fresh milk, eggs & butter at your doorstep',
      image: 'https://images.unsplash.com/photo-1528750901443-d93a7782d132?w=1000',
      ctaText: 'View Dairy',
      ctaLink: '/categories/dairy-eggs',
      isActive: true,
      sortOrder: 2,
    },
    {
      title: 'Chilled Beverages',
      subtitle: 'Stay refreshed with juices & soft drinks',
      image: 'https://images.unsplash.com/photo-1527960656366-ee2a999e3286?w=1000',
      ctaText: 'Browse Drinks',
      ctaLink: '/categories/beverages',
      isActive: true,
      sortOrder: 3,
    },
  ];

  for (const b of bannersData) {
    await prisma.banner.create({
      data: b,
    });
  }
  console.log('✅ Banners seeded.');

  console.log('🎉 Database seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
