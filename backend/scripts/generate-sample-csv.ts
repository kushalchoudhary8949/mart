import fs from 'fs';
import path from 'path';

const categories = [
  {
    slug: 'fruits-vegetables',
    icon: 'fa-carrot',
    items: [
      { name: 'Fresh Organic Tomatoes', unit: '1 kg', price: 35, mrp: 45, image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500' },
      { name: 'Red Robusta Bananas', unit: '1 dozen', price: 48, mrp: 60, image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=500' },
      { name: 'Crisp Shimla Apples', unit: '1 kg', price: 160, mrp: 200, image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500' },
      { name: 'Fresh Farm Onions', unit: '1 kg', price: 28, mrp: 38, image: 'https://images.unsplash.com/photo-1618512496248-a3c25c2f2b8e?w=500' },
      { name: 'New Crop Potatoes', unit: '1 kg', price: 24, mrp: 32, image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=500' },
      { name: 'Green Bell Capsicum', unit: '500 g', price: 42, mrp: 55, image: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=500' },
      { name: 'Fresh Spinach Bunch', unit: '250 g', price: 20, mrp: 28, image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=500' },
      { name: 'Orange Carrots', unit: '500 g', price: 32, mrp: 40, image: 'https://images.unsplash.com/photo-1447175008436-054170c2e979?w=500' },
      { name: 'Green Broccoli', unit: '1 pc', price: 65, mrp: 85, image: 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=500' },
      { name: 'Fresh Garlic', unit: '250 g', price: 55, mrp: 70, image: 'https://images.unsplash.com/photo-1540148426945-6cf22a6b2383?w=500' },
    ],
  },
  {
    slug: 'dairy-eggs',
    icon: 'fa-egg',
    items: [
      { name: 'Full Cream Milk Pouch', unit: '500 ml', price: 34, mrp: 34, image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500' },
      { name: 'Farm Fresh White Eggs', unit: '6 pcs', price: 42, mrp: 50, image: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=500' },
      { name: 'Fresh Malai Paneer', unit: '200 g', price: 88, mrp: 99, image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500' },
      { name: 'Salted Butter Block', unit: '100 g', price: 56, mrp: 60, image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=500' },
      { name: 'Greek Plain Yogurt', unit: '400 g', price: 60, mrp: 75, image: 'https://images.unsplash.com/photo-1571212515416-fca988083f43?w=500' },
      { name: 'Sandwich Cheese Slices', unit: '200 g', price: 125, mrp: 145, image: 'https://images.unsplash.com/photo-1618164436241-4473940d1f5c?w=500' },
    ],
  },
  {
    slug: 'bakery',
    icon: 'fa-bread-slice',
    items: [
      { name: '100% Whole Wheat Bread', unit: '400 g', price: 45, mrp: 50, image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500' },
      { name: 'French Butter Croissant', unit: '2 pcs', price: 85, mrp: 100, image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500' },
      { name: 'Double Choco Chip Muffin', unit: '4 pcs', price: 110, mrp: 130, image: 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=500' },
      { name: 'Sesame Burger Buns', unit: '4 pcs', price: 40, mrp: 48, image: 'https://images.unsplash.com/photo-1584736286279-11c8f11b7ca4?w=500' },
    ],
  },
  {
    slug: 'beverages',
    icon: 'fa-mug-hot',
    items: [
      { name: 'Natural Orange Juice', unit: '1 L', price: 115, mrp: 135, image: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=500' },
      { name: 'Classic Green Tea Bags', unit: '25 bags', price: 175, mrp: 210, image: 'https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5?w=500' },
      { name: 'Chilled Cola Soft Drink', unit: '750 ml', price: 40, mrp: 45, image: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=500' },
      { name: 'Rich Dark Roast Coffee', unit: '200 g', price: 240, mrp: 290, image: 'https://images.unsplash.com/photo-1610889556528-9a770e32642f?w=500' },
    ],
  },
  {
    slug: 'snacks',
    icon: 'fa-cookie-bite',
    items: [
      { name: 'Crispy Salted Potato Chips', unit: '90 g', price: 20, mrp: 20, image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=500' },
      { name: 'Roasted Salted Almonds', unit: '250 g', price: 260, mrp: 320, image: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=500' },
      { name: 'Butter Choco Chip Cookies', unit: '150 g', price: 50, mrp: 60, image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=500' },
      { name: 'Golden Cheese Popcorn', unit: '100 g', price: 45, mrp: 55, image: 'https://images.unsplash.com/photo-1578849278619-e73505e9610f?w=500' },
    ],
  },
  {
    slug: 'staples-grains',
    icon: 'fa-wheat-awn',
    items: [
      { name: 'Royal Long Grain Basmati Rice', unit: '5 kg', price: 440, mrp: 520, image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500' },
      { name: 'Chakki Fresh Whole Wheat Atta', unit: '5 kg', price: 225, mrp: 260, image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500' },
      { name: 'Unpolished Premium Toor Dal', unit: '1 kg', price: 145, mrp: 170, image: 'https://images.unsplash.com/photo-1585059895524-72359e06133a?w=500' },
      { name: 'Refined Sunflower Oil Pouch', unit: '1 L', price: 135, mrp: 155, image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500' },
    ],
  },
];

const variants = [
  'Premium', 'Organic', 'Select', 'Fresh', 'Special', 'Deluxe', 'Classic', 
  'Handpicked', 'Natural', 'Daily', 'Value Pack', 'Super Saver', 'Gold', 
  'Chef Edition', 'Local Sourced', 'Farm Fresh'
];

function generate1000ProductsCSV() {
  const targetCount = 1000;
  const rows: string[] = [];
  rows.push('name,category_slug,price,mrp,unit,stock,image_url,description');

  let count = 0;
  let categoryIdx = 0;

  while (count < targetCount) {
    const cat = categories[categoryIdx % categories.length];
    const baseItem = cat.items[count % cat.items.length];
    const variant = variants[Math.floor(count / cat.items.length) % variants.length];

    const name = `${variant} ${baseItem.name} #${count + 1}`;
    const price = Math.round(baseItem.price + ((count % 15) * 5));
    const mrp = Math.round(price * 1.2);
    const stock = 50 + (count % 150);
    const unit = baseItem.unit;
    const image = baseItem.image;
    const description = `Enjoy fresh ${name}. High quality grocery product delivered directly to your doorstep by Vrindavan Mart.`;

    rows.push(`"${name}","${cat.slug}",${price},${mrp},"${unit}",${stock},"${image}","${description}"`);
    count++;
    categoryIdx++;
  }

  const outputPath = path.join(__dirname, '../products.csv');
  fs.writeFileSync(outputPath, rows.join('\n'));
  console.log(`✅ Generated 1,000 product sample CSV at: ${outputPath}`);
}

generate1000ProductsCSV();
