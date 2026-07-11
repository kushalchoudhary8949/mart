-- ============================================================
-- Grocery Mart - Production Enhancements Schema
-- ============================================================

-- Banners table for homepage promotions
CREATE TABLE IF NOT EXISTS banners (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  subtitle TEXT,
  image TEXT NOT NULL,
  cta_text TEXT DEFAULT 'Shop Now',
  cta_link TEXT DEFAULT '/categories',
  active INTEGER DEFAULT 1,
  sort_order INTEGER DEFAULT 0,
  expires_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Product images table for product galleries
CREATE TABLE IF NOT EXISTS product_images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL,
  url TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Add rating columns to orders for delivery rating
ALTER TABLE orders ADD COLUMN rating INTEGER CHECK(rating >= 1 AND rating <= 5);
ALTER TABLE orders ADD COLUMN rating_comment TEXT;

-- Add active status flag to products for soft delete
ALTER TABLE products ADD COLUMN is_active INTEGER NOT NULL DEFAULT 1;

-- Add performance and lookup indexes
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_cart_user ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_user ON wishlist_items(user_id);
CREATE INDEX IF NOT EXISTS idx_notifs_user_unread ON notifications(user_id, is_read);
