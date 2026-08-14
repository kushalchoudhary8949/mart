#!/usr/bin/env node
/**
 * Converts backend/products.csv into a D1-compatible SQL file (seed-csv-products.sql)
 * that can be loaded via: npm run db:console:local -- --file=./seed-csv-products.sql
 *
 * Usage:  node scripts/csv-to-d1-seed.js
 */

const fs = require('fs');
const path = require('path');

const CSV_PATH = path.join(__dirname, '..', 'backend', 'products.csv');
const OUT_PATH = path.join(__dirname, '..', 'seed-csv-products.sql');

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function parseCSVLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim().replace(/^"|"$/g, ''));
      current = '';
    } else {
      current += char;
    }
  }
  values.push(current.trim().replace(/^"|"$/g, ''));
  return values;
}

function escapeSql(str) {
  if (!str) return '';
  return str.replace(/'/g, "''");
}

// ── Main ──────────────────────────────────────────────────────────────────────
const content = fs.readFileSync(CSV_PATH, 'utf-8');
const lines = content.split('\n').filter((l) => l.trim().length > 0);

if (lines.length <= 1) {
  console.error('CSV file is empty or only has headers.');
  process.exit(1);
}

const headers = parseCSVLine(lines[0]).map((h) => h.toLowerCase().trim());
const nameIdx = headers.indexOf('name');
const catIdx = headers.indexOf('category_slug');
const priceIdx = headers.indexOf('price');
const mrpIdx = headers.indexOf('mrp');
const unitIdx = headers.indexOf('unit');
const stockIdx = headers.indexOf('stock');
const imageIdx = headers.indexOf('image_url');
const descIdx = headers.indexOf('description');

// Map category_slug → category_id (must match the IDs from seed.sql)
const CATEGORY_MAP = {
  'fruits-vegetables': 1,
  'dairy-eggs': 2,
  'bakery': 3,
  'beverages': 4,
  'snacks': 5,
  'staples-grains': 6,
  'meat-seafood': 7,
  'personal-care': 8,
  'household': 9,
  'frozen-foods': 10,
};

const sqlLines = [];
sqlLines.push('-- ============================================================');
sqlLines.push('-- Auto-generated from backend/products.csv');
sqlLines.push('-- ============================================================');
sqlLines.push('');

const usedSlugs = new Set();

for (let i = 1; i < lines.length; i++) {
  const row = parseCSVLine(lines[i]);
  if (!row[nameIdx]) continue;

  const name = row[nameIdx];
  let slug = slugify(name);
  // Ensure unique slug
  if (usedSlugs.has(slug)) {
    slug = `${slug}-${i}`;
  }
  usedSlugs.add(slug);

  const categorySlug = (row[catIdx] || 'general').toLowerCase().trim();
  const categoryId = CATEGORY_MAP[categorySlug] || 1;
  const price = parseFloat(row[priceIdx] || '0');
  const mrp = mrpIdx !== -1 && row[mrpIdx] ? parseFloat(row[mrpIdx]) : Math.round(price * 1.15);
  const unit = unitIdx !== -1 && row[unitIdx] ? row[unitIdx] : '1 unit';
  const stock = stockIdx !== -1 && row[stockIdx] ? parseInt(row[stockIdx], 10) : 100;
  const image = imageIdx !== -1 && row[imageIdx] ? row[imageIdx] : 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500';
  const description = descIdx !== -1 && row[descIdx] ? row[descIdx] : `${name} - Fresh & high quality grocery item.`;
  const isFeatured = i % 7 === 0 ? 1 : 0;

  sqlLines.push(
    `INSERT OR IGNORE INTO products (category_id, name, slug, description, price, mrp, unit, image, stock, rating, rating_count, is_featured, is_active) VALUES (${categoryId}, '${escapeSql(name)}', '${escapeSql(slug)}', '${escapeSql(description)}', ${price}, ${mrp}, '${escapeSql(unit)}', '${escapeSql(image)}', ${stock}, ${(4 + Math.random()).toFixed(1)}, ${Math.floor(Math.random() * 200 + 20)}, ${isFeatured}, 1);`
  );
}

fs.writeFileSync(OUT_PATH, sqlLines.join('\n') + '\n', 'utf-8');
console.log(`✅ Generated ${sqlLines.length - 3} INSERT statements → ${OUT_PATH}`);
console.log('');
console.log('To import into local D1, run:');
console.log('  wrangler d1 execute webapp-production --local --file=./seed-csv-products.sql');
