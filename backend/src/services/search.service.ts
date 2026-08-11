import { prisma } from '../config/database';
import { redis } from '../config/redis';
import { Prisma } from '@prisma/client';
import { config } from '../config';

// Re-use the same image optimization as catalog.service
function optimizeImageUrl(url: string | null | undefined, width = 400): string | null {
  if (!url) return null;
  if (url.startsWith('data:') || url.includes('wsrv.nl')) return url;
  if (config.env === 'development') return url;
  return `https://wsrv.nl/?url=${encodeURIComponent(url)}&w=${width}&q=80&output=webp&default=placeholder`;
}

const modeInsensitive = Prisma.QueryMode.insensitive;

// ─── Hinglish & Vernacular Synonym Mapping (Blinkit / Zepto style) ───────────

const SYNONYM_MAP: Record<string, string[]> = {
  tamatar: ['tomato', 'tomatoes'],
  tomato: ['tamatar', 'tomatoes'],
  tomatoes: ['tamatar', 'tomato'],
  aalu: ['potato', 'potatoes'],
  aloo: ['potato', 'potatoes'],
  potato: ['aalu', 'aloo', 'potatoes'],
  pyaz: ['onion', 'onions'],
  kanda: ['onion', 'onions'],
  onion: ['pyaz', 'kanda', 'onions'],
  doodh: ['milk'],
  milk: ['doodh', 'cream', 'dairy'],
  dahi: ['curd', 'yogurt'],
  curd: ['dahi', 'yogurt'],
  yogurt: ['dahi', 'curd'],
  anda: ['egg', 'eggs'],
  ande: ['egg', 'eggs'],
  egg: ['anda', 'ande', 'eggs'],
  eggs: ['anda', 'ande', 'egg'],
  cheeni: ['sugar'],
  chini: ['sugar'],
  sugar: ['cheeni', 'chini'],
  tel: ['oil', 'sunflower'],
  oil: ['tel', 'sunflower'],
  atta: ['flour', 'wheat'],
  aata: ['flour', 'wheat'],
  flour: ['atta', 'aata', 'wheat'],
  wheat: ['atta', 'aata', 'flour'],
  chawal: ['rice', 'basmati'],
  rice: ['chawal', 'basmati'],
  biskut: ['biscuit', 'cookies', 'cookie'],
  biscuit: ['biskut', 'cookie', 'cookies'],
  biscuits: ['biskut', 'cookie', 'cookies'],
  cookies: ['biscuit', 'biskut'],
  chips: ['potato chips', 'wafers'],
  paneer: ['cottage cheese', 'paneer'],
  mutton: ['meat'],
  chicken: ['meat', 'poultry'],
  ghee: ['butter', 'ghee'],
  butter: ['ghee', 'butter'],
  chai: ['tea'],
  tea: ['chai', 'green tea'],
  coffee: ['instant coffee', 'roast'],
  sabzi: ['vegetables', 'veggies'],
  vegetables: ['sabzi', 'veggies', 'fruits'],
  veggies: ['sabzi', 'vegetables'],
  fruit: ['fruits', 'apple', 'banana'],
  fruits: ['fruit', 'apple', 'banana'],
  makhana: ['foxnuts'],
  palak: ['spinach'],
  spinach: ['palak'],
  gajar: ['carrot', 'carrots'],
  carrot: ['gajar', 'carrots'],
  carrots: ['gajar', 'carrot'],
  kela: ['banana', 'bananas'],
  banana: ['kela', 'bananas'],
  bananas: ['kela', 'banana'],
  seb: ['apple', 'apples'],
  apple: ['seb', 'apples'],
  apples: ['seb', 'apple'],
  mirchi: ['chilli', 'capsicum', 'pepper'],
  capsicum: ['mirchi', 'pepper'],
  bread: ['wheat bread', 'bakery', 'bun', 'buns'],
  juice: ['orange juice', 'drink', 'beverages'],
};

// ─── Levenshtein Distance for Typo Tolerance ────────────────────────────────

function levenshteinDistance(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Expand query tokens using synonyms and spell-checking.
 */
export function expandSearchTerms(query: string): string[] {
  const clean = query.toLowerCase().trim().replace(/[^a-z0-9\s]/g, '');
  const tokens = clean.split(/\s+/).filter(Boolean);
  const searchTerms = new Set<string>(tokens);

  for (const token of tokens) {
    // 1. Direct synonym lookup
    if (SYNONYM_MAP[token]) {
      SYNONYM_MAP[token].forEach((syn) => searchTerms.add(syn));
    }

    // 2. Fuzzy match against dictionary keys (for 1-2 char typos)
    if (token.length >= 4) {
      for (const dictKey of Object.keys(SYNONYM_MAP)) {
        const distance = levenshteinDistance(token, dictKey);
        if (distance <= 1 || (token.length >= 6 && distance <= 2)) {
          searchTerms.add(dictKey);
          SYNONYM_MAP[dictKey].forEach((syn) => searchTerms.add(syn));
        }
      }
    }
  }

  return Array.from(searchTerms);
}

/**
 * Calculate relevance score for a product given search tokens.
 */
function calculateRelevanceScore(
  product: {
    name: string;
    description: string | null;
    stock: number;
    rating: number;
    isFeatured: boolean;
    category: { name: string; slug: string };
  },
  query: string,
  expandedTerms: string[]
): number {
  let score = 0;
  const pName = product.name.toLowerCase();
  const pDesc = (product.description || '').toLowerCase();
  const cName = product.category.name.toLowerCase();
  const qLower = query.toLowerCase().trim();

  // 1. Exact full query match in title (Highest priority)
  if (pName === qLower) score += 200;
  else if (pName.startsWith(qLower)) score += 150;
  else if (pName.includes(qLower)) score += 100;

  // 2. Token / Synonym matching
  for (const term of expandedTerms) {
    if (pName.includes(term)) {
      score += 40;
    }
    if (cName.includes(term)) {
      score += 25;
    }
    if (pDesc.includes(term)) {
      score += 10;
    }
  }

  // 3. Stock Availability Boost (Blinkit style: in-stock items ranked first)
  if (product.stock > 0) score += 30;

  // 4. Rating & Bestseller boost
  score += product.rating * 4;
  if (product.isFeatured) score += 15;

  return score;
}

/**
 * Advanced Search for products with Blinkit/Zepto-style ranking and typo tolerance.
 */
export async function searchProducts(filters: {
  q?: string;
  category?: string;
  featured?: boolean;
  sort?: 'price_asc' | 'price_desc' | 'rating' | 'name' | 'relevance';
  page?: number;
  limit?: number;
}) {
  const { q, category, featured, sort = 'relevance', page = 1, limit = 20 } = filters;

  if (!q || q.trim().length === 0) {
    // If no query string, fall back to default database query
    const { findMany } = await import('../repositories/product.repository');
    return findMany({ categorySlug: category, featured, activeOnly: true, sort: sort as any, page, limit });
  }

  const cacheKey = `search:v2:${q.trim().toLowerCase()}:${category || ''}:${page}:${limit}:${sort}`;
  try {
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);
  } catch {}

  const expandedTerms = expandSearchTerms(q);

  // Build Prisma OR search conditions for initial candidate retrieval
  const where: Prisma.ProductWhereInput = { isActive: true };

  if (category) {
    where.category = { slug: category };
  }

  if (featured !== undefined) {
    where.isFeatured = featured;
  }

  where.OR = [
    { name: { contains: q, mode: modeInsensitive } },
    { description: { contains: q, mode: modeInsensitive } },
    { category: { name: { contains: q, mode: modeInsensitive } } },
    ...expandedTerms.map((term) => ({ name: { contains: term, mode: modeInsensitive } })),
    ...expandedTerms.map((term) => ({ category: { name: { contains: term, mode: modeInsensitive } } })),
  ];

  // Fetch candidates from DB
  const candidates = await prisma.product.findMany({
    where,
    include: {
      category: { select: { name: true, slug: true } },
      images: { orderBy: { sortOrder: 'asc' }, select: { url: true } },
    },
  });

  // Calculate relevance scores and rank candidates
  const scored = candidates.map((product) => ({
    product,
    score: calculateRelevanceScore(product, q, expandedTerms),
  }));

  // Sort candidates
  if (sort === 'price_asc') {
    scored.sort((a, b) => a.product.price - b.product.price);
  } else if (sort === 'price_desc') {
    scored.sort((a, b) => b.product.price - a.product.price);
  } else if (sort === 'rating') {
    scored.sort((a, b) => b.product.rating - a.product.rating);
  } else {
    // Default: Sort by relevance score descending
    scored.sort((a, b) => b.score - a.score);
  }

  // Apply pagination
  const total = scored.length;
  const offset = (page - 1) * limit;
  const paginated = scored.slice(offset, offset + limit).map((s) => s.product);

  const mappedProducts = paginated.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: p.price,
    mrp: p.mrp,
    unit: p.unit,
    image: optimizeImageUrl(p.thumbnail ?? p.images?.[0]?.url ?? null, 300),
    stock: p.stock,
    rating: p.rating,
    rating_count: p.ratingCount,
    is_featured: p.isFeatured ? 1 : 0,
    category_name: p.category.name,
    category_slug: p.category.slug,
  }));

  const result = {
    products: mappedProducts,
    total,
    pagination: {
      page,
      limit,
      total,
      total_pages: Math.ceil(total / limit),
    },
    expanded_search_terms: expandedTerms,
  };

  try { await redis.set(cacheKey, JSON.stringify(result), 'EX', 60); } catch {}
  return result;
}

/**
 * Instant Autocomplete Suggestions API (Blinkit style search dropdown)
 */
export async function getSearchSuggestions(query: string) {
  if (!query || query.trim().length < 2) {
    return { suggestions: [], categories: [], products: [] };
  }

  const clean = query.trim().toLowerCase();
  const cacheKey = `suggestions:${clean}`;

  try {
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);
  } catch {}

  const expandedTerms = expandSearchTerms(clean);

  // Fetch top matching categories and products concurrently
  const [matchingCategories, matchingProducts] = await Promise.all([
    prisma.category.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: clean, mode: modeInsensitive } },
          { slug: { contains: clean, mode: modeInsensitive } },
          ...expandedTerms.map((t) => ({ name: { contains: t, mode: modeInsensitive } })),
        ],
      },
      take: 3,
      select: { id: true, name: true, slug: true, icon: true },
    }),
    prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: clean, mode: modeInsensitive } },
          ...expandedTerms.map((t) => ({ name: { contains: t, mode: modeInsensitive } })),
        ],
      },
      take: 6,
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        mrp: true,
        unit: true,
        thumbnail: true,
        stock: true,
        category: { select: { name: true, slug: true } },
      },
    }),
  ]);

  // Extract unique suggestion strings
  const suggestionsSet = new Set<string>();
  matchingProducts.forEach((p) => suggestionsSet.add(p.name));
  matchingCategories.forEach((c) => suggestionsSet.add(c.name));

  const result = {
    suggestions: Array.from(suggestionsSet).slice(0, 5),
    categories: matchingCategories,
    products: matchingProducts.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: p.price,
      mrp: p.mrp,
      unit: p.unit,
      image: optimizeImageUrl(p.thumbnail, 200),
      category_name: p.category.name,
    })),
  };

  try { await redis.set(cacheKey, JSON.stringify(result), 'EX', 120); } catch {}
  return result;
}
