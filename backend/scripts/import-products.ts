import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, '-');
}

function parseCSVLine(line: string): string[] {
  const values: string[] = [];
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

async function importProducts() {
  const csvPath = process.argv[2] 
    ? path.resolve(process.argv[2]) 
    : path.join(__dirname, '../products.csv');

  if (!fs.existsSync(csvPath)) {
    console.error(`❌ CSV file not found at: ${csvPath}`);
    console.log(`💡 Usage: npx ts-node scripts/import-products.ts [path/to/products.csv]`);
    process.exit(1);
  }

  console.log(`📦 Reading CSV from: ${csvPath}...`);
  const content = fs.readFileSync(csvPath, 'utf-8');
  const lines = content.split('\n').filter((line) => line.trim().length > 0);

  if (lines.length <= 1) {
    console.error('❌ CSV file is empty or only has headers.');
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

  if (nameIdx === -1 || catIdx === -1 || priceIdx === -1) {
    console.error('❌ Missing required CSV columns: name, category_slug, price');
    process.exit(1);
  }

  // Pre-fetch categories
  const existingCategories = await prisma.category.findMany();
  const catMap = new Map<string, number>();
  existingCategories.forEach((c) => catMap.set(c.slug, c.id));

  let importedCount = 0;
  let updatedCount = 0;
  let skippedCount = 0;

  console.log(`🚀 Starting bulk import of ${lines.length - 1} products...`);

  for (let i = 1; i < lines.length; i++) {
    const row = parseCSVLine(lines[i]);
    if (!row[nameIdx]) continue;

    const name = row[nameIdx];
    const categorySlug = slugify(row[catIdx] || 'general');
    const baseSlug = slugify(name);
    const price = parseFloat(row[priceIdx] || '0');
    const mrp = parseFloat(mrpIdx !== -1 && row[mrpIdx] ? row[mrpIdx] : String(price * 1.15));
    const unit = unitIdx !== -1 && row[unitIdx] ? row[unitIdx] : '1 unit';
    const stock = stockIdx !== -1 && row[stockIdx] ? parseInt(row[stockIdx], 10) : 100;
    const thumbnail = imageIdx !== -1 && row[imageIdx] ? row[imageIdx] : 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500';
    const description = descIdx !== -1 && row[descIdx] ? row[descIdx] : `${name} - Fresh & high quality grocery item.`;

    // Ensure category exists
    let categoryId = catMap.get(categorySlug);
    if (!categoryId) {
      const categoryName = categorySlug
        .split('-')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
      const newCat = await prisma.category.create({
        data: {
          name: categoryName,
          slug: categorySlug,
          icon: 'fa-box',
        },
      });
      categoryId = newCat.id;
      catMap.set(categorySlug, categoryId);
    }

    const slug = baseSlug;

    try {
      const existingProduct = await prisma.product.findFirst({
        where: { OR: [{ slug }, { name }] },
      });

      if (existingProduct) {
        await prisma.product.update({
          where: { id: existingProduct.id },
          data: {
            categoryId,
            price,
            mrp,
            unit,
            stock,
            thumbnail,
            description,
          },
        });
        updatedCount++;
      } else {
        await prisma.product.create({
          data: {
            name,
            slug: `${slug}-${Date.now().toString().slice(-4)}${i}`,
            categoryId,
            price,
            mrp,
            unit,
            stock,
            thumbnail,
            description,
            isFeatured: i % 7 === 0,
            isActive: true,
          },
        });
        importedCount++;
      }

      if (i % 100 === 0) {
        console.log(`⏳ Progress: ${i}/${lines.length - 1} products processed...`);
      }
    } catch (err: any) {
      console.warn(`⚠️ Skipped row ${i} (${name}):`, err.message);
      skippedCount++;
    }
  }

  console.log(`\n✅ Import Finished!`);
  console.log(`✨ Created: ${importedCount} products`);
  console.log(`🔄 Updated: ${updatedCount} products`);
  if (skippedCount > 0) console.log(`⚠️ Skipped: ${skippedCount} items due to errors`);
}

importProducts()
  .catch((err) => {
    console.error('💥 Fatal import error:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
