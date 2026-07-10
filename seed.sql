-- ============================================================
-- Grocery Mart - Seed Data
-- ============================================================

INSERT OR IGNORE INTO categories (id, name, slug, icon, sort_order) VALUES
  (1, 'Fruits & Vegetables', 'fruits-vegetables', 'fa-carrot', 1),
  (2, 'Dairy & Eggs', 'dairy-eggs', 'fa-egg', 2),
  (3, 'Bakery', 'bakery', 'fa-bread-slice', 3),
  (4, 'Beverages', 'beverages', 'fa-mug-hot', 4),
  (5, 'Snacks', 'snacks', 'fa-cookie-bite', 5),
  (6, 'Staples & Grains', 'staples-grains', 'fa-wheat-awn', 6),
  (7, 'Meat & Seafood', 'meat-seafood', 'fa-fish', 7),
  (8, 'Personal Care', 'personal-care', 'fa-pump-soap', 8),
  (9, 'Household', 'household', 'fa-broom', 9),
  (10, 'Frozen Foods', 'frozen-foods', 'fa-snowflake', 10);

INSERT OR IGNORE INTO products (category_id, name, slug, description, price, mrp, unit, image, stock, rating, rating_count, is_featured) VALUES
-- Fruits & Vegetables
(1, 'Fresh Bananas', 'fresh-bananas', 'Naturally ripened, sweet and fresh bananas sourced from local farms.', 39, 49, '1 dozen', 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=500', 120, 4.5, 320, 1),
(1, 'Red Apples', 'red-apples', 'Crisp and juicy red apples, rich in fiber and antioxidants.', 149, 179, '1 kg', 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500', 90, 4.6, 210, 1),
(1, 'Fresh Tomatoes', 'fresh-tomatoes', 'Farm-fresh red tomatoes, perfect for curries and salads.', 29, 40, '1 kg', 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500', 150, 4.2, 180, 0),
(1, 'Potatoes', 'potatoes', 'Premium quality potatoes, great for all your cooking needs.', 25, 35, '1 kg', 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=500', 200, 4.3, 150, 0),
(1, 'Onions', 'onions', 'Fresh red onions with strong flavor, a kitchen essential.', 32, 45, '1 kg', 'https://images.unsplash.com/photo-1618512496248-a3c25c2f2b8e?w=500', 200, 4.1, 140, 0),
(1, 'Green Capsicum', 'green-capsicum', 'Crunchy and fresh green bell peppers.', 45, 60, '500 g', 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=500', 80, 4.0, 60, 0),
(1, 'Spinach Bunch', 'spinach-bunch', 'Fresh green spinach leaves, packed with iron.', 20, 25, '1 bunch', 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=500', 70, 4.4, 90, 0),
(1, 'Carrots', 'carrots', 'Sweet and crunchy orange carrots.', 35, 45, '500 g', 'https://images.unsplash.com/photo-1447175008436-054170c2e979?w=500', 90, 4.3, 75, 0),

-- Dairy & Eggs
(2, 'Full Cream Milk', 'full-cream-milk', 'Pasteurized full cream milk, rich in calcium and protein.', 62, 68, '1 L', 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500', 100, 4.7, 400, 1),
(2, 'Farm Eggs', 'farm-eggs', 'Fresh brown eggs from free-range hens.', 78, 90, '12 pcs', 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=500', 100, 4.6, 260, 1),
(2, 'Greek Yogurt', 'greek-yogurt', 'Thick and creamy greek style yogurt.', 55, 65, '400 g', 'https://images.unsplash.com/photo-1571212515416-fca988083f43?w=500', 60, 4.5, 130, 0),
(2, 'Butter', 'butter', 'Creamy salted butter made from fresh milk.', 52, 58, '100 g', 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=500', 80, 4.4, 95, 0),
(2, 'Cheese Slices', 'cheese-slices', 'Delicious processed cheese slices for sandwiches.', 120, 140, '200 g', 'https://images.unsplash.com/photo-1618164436241-4473940d1f5c?w=500', 70, 4.3, 88, 0),
(2, 'Paneer', 'paneer', 'Fresh soft cottage cheese, high in protein.', 90, 100, '200 g', 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500', 65, 4.6, 150, 0),

-- Bakery
(3, 'Whole Wheat Bread', 'whole-wheat-bread', 'Soft and healthy whole wheat bread loaf.', 45, 50, '400 g', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500', 60, 4.4, 120, 1),
(3, 'Croissants', 'croissants', 'Buttery and flaky French croissants, pack of 4.', 99, 120, '4 pcs', 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500', 40, 4.5, 70, 0),
(3, 'Chocolate Muffins', 'chocolate-muffins', 'Rich chocolate muffins, pack of 6.', 129, 150, '6 pcs', 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=500', 35, 4.3, 55, 0),
(3, 'Burger Buns', 'burger-buns', 'Soft sesame burger buns, pack of 6.', 60, 70, '6 pcs', 'https://images.unsplash.com/photo-1584736286279-11c8f11b7ca4?w=500', 45, 4.2, 40, 0),

-- Beverages
(4, 'Orange Juice', 'orange-juice', '100% natural orange juice, no added sugar.', 110, 130, '1 L', 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=500', 55, 4.5, 100, 1),
(4, 'Green Tea', 'green-tea', 'Antioxidant rich green tea bags, pack of 25.', 180, 220, '25 bags', 'https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5?w=500', 50, 4.4, 80, 0),
(4, 'Cola Soft Drink', 'cola-soft-drink', 'Chilled and fizzy cola soft drink.', 40, 45, '750 ml', 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=500', 100, 4.1, 200, 0),
(4, 'Instant Coffee', 'instant-coffee', 'Rich and aromatic instant coffee powder.', 210, 250, '200 g', 'https://images.unsplash.com/photo-1610889556528-9a770e32642f?w=500', 45, 4.6, 160, 1),
(4, 'Mineral Water', 'mineral-water', 'Pure and safe packaged drinking water.', 20, 25, '1 L', 'https://images.unsplash.com/photo-1560023907-5f339617ea30?w=500', 200, 4.3, 90, 0),

-- Snacks
(5, 'Potato Chips', 'potato-chips', 'Crispy salted potato chips.', 30, 35, '90 g', 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=500', 120, 4.2, 210, 1),
(5, 'Mixed Nuts', 'mixed-nuts', 'Premium roasted mixed nuts, healthy snacking.', 250, 300, '250 g', 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=500', 40, 4.7, 130, 1),
(5, 'Chocolate Cookies', 'chocolate-cookies', 'Crunchy chocolate chip cookies.', 55, 65, '200 g', 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=500', 90, 4.4, 150, 0),
(5, 'Popcorn', 'popcorn', 'Butter flavored ready-to-eat popcorn.', 45, 55, '150 g', 'https://images.unsplash.com/photo-1578849278619-e73505e9610f?w=500', 70, 4.1, 60, 0),

-- Staples & Grains
(6, 'Basmati Rice', 'basmati-rice', 'Premium long grain basmati rice.', 180, 210, '5 kg', 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500', 60, 4.6, 220, 1),
(6, 'Whole Wheat Atta', 'whole-wheat-atta', 'Stone ground whole wheat flour.', 220, 250, '5 kg', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500', 55, 4.5, 190, 1),
(6, 'Toor Dal', 'toor-dal', 'Premium quality split pigeon peas.', 140, 160, '1 kg', 'https://images.unsplash.com/photo-1585059895524-72359e06133a?w=500', 70, 4.4, 110, 0),
(6, 'Sunflower Oil', 'sunflower-oil', 'Refined sunflower cooking oil.', 165, 185, '1 L', 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500', 80, 4.3, 140, 0),
(6, 'Sugar', 'sugar', 'Pure refined white sugar.', 48, 55, '1 kg', 'https://images.unsplash.com/photo-1581441363689-94db8f2b52e2?w=500', 100, 4.2, 90, 0),

-- Meat & Seafood
(7, 'Chicken Breast', 'chicken-breast', 'Fresh boneless chicken breast.', 220, 250, '500 g', 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=500', 40, 4.5, 120, 1),
(7, 'Fresh Prawns', 'fresh-prawns', 'Cleaned and deveined fresh prawns.', 380, 420, '500 g', 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=500', 25, 4.6, 70, 0),
(7, 'Mutton Curry Cut', 'mutton-curry-cut', 'Fresh mutton curry cut pieces.', 480, 520, '500 g', 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=500', 20, 4.4, 55, 0),

-- Personal Care
(8, 'Shampoo', 'shampoo', 'Nourishing shampoo for all hair types.', 199, 230, '340 ml', 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500', 50, 4.3, 95, 0),
(8, 'Body Wash', 'body-wash', 'Refreshing moisturizing body wash.', 175, 199, '250 ml', 'https://images.unsplash.com/photo-1585232004423-42d9d1d6b6c9?w=500', 45, 4.2, 65, 0),
(8, 'Toothpaste', 'toothpaste', 'Cavity protection toothpaste with fluoride.', 55, 65, '150 g', 'https://images.unsplash.com/photo-1559591935-c6c92c6d7ea1?w=500', 90, 4.4, 130, 0),

-- Household
(9, 'Dish Wash Liquid', 'dish-wash-liquid', 'Effective grease removing dish wash liquid.', 99, 115, '500 ml', 'https://images.unsplash.com/photo-1585421514738-01798e348b17?w=500', 60, 4.3, 80, 0),
(9, 'Laundry Detergent', 'laundry-detergent', 'Powerful stain removing laundry detergent powder.', 220, 250, '1 kg', 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=500', 40, 4.4, 100, 0),
(9, 'Tissue Paper Rolls', 'tissue-paper-rolls', 'Soft and strong tissue paper rolls, pack of 4.', 150, 175, '4 rolls', 'https://images.unsplash.com/photo-1584556812952-905ffd0c611a?w=500', 55, 4.2, 45, 0),

-- Frozen Foods
(10, 'Frozen Peas', 'frozen-peas', 'Farm fresh frozen green peas.', 65, 75, '500 g', 'https://images.unsplash.com/photo-1587735243615-c03f25aaff15?w=500', 50, 4.3, 60, 0),
(10, 'Frozen French Fries', 'frozen-french-fries', 'Crispy golden frozen french fries.', 110, 130, '750 g', 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500', 45, 4.5, 85, 1),
(10, 'Veg Momos', 'veg-momos', 'Ready-to-steam vegetable momos.', 140, 160, '400 g', 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=500', 35, 4.4, 50, 0);

INSERT OR IGNORE INTO coupons (code, description, discount_type, discount_value, min_order_value, max_discount, usage_limit, active, expires_at) VALUES
('WELCOME50', 'Flat ₹50 off on your first order', 'flat', 50, 199, NULL, 0, 1, '2027-12-31 23:59:59'),
('SAVE10', '10% off on orders above ₹300', 'percent', 10, 300, 100, 0, 1, '2027-12-31 23:59:59'),
('FRESH20', '20% off on orders above ₹500', 'percent', 20, 500, 200, 0, 1, '2027-12-31 23:59:59'),
('FLAT100', 'Flat ₹100 off on orders above ₹800', 'flat', 100, 800, NULL, 0, 1, '2027-12-31 23:59:59');
