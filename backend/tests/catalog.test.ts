import { jest } from '@jest/globals';
import * as adminCatalogService from '../src/services/admin-catalog.service';
import * as categoryRepo from '../src/repositories/category.repository';
import * as productRepo from '../src/repositories/product.repository';

jest.mock('../src/repositories/category.repository', () => ({
  findById: jest.fn(),
  findBySlug: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
}));

jest.mock('../src/repositories/product.repository', () => ({
  findBySlug: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  deactivate: jest.fn(),
  findById: jest.fn(),
  findAllAdmin: jest.fn(),
  findMany: jest.fn(),
  findRelated: jest.fn(),
}));

describe('Catalog admin service', () => {
  const mockedCategoryRepo = categoryRepo as jest.Mocked<typeof categoryRepo>;
  const mockedProductRepo = productRepo as jest.Mocked<typeof productRepo>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('maps uploaded product images to the thumbnail field when creating a product', async () => {
    mockedCategoryRepo.findById.mockResolvedValue({ id: 1, slug: 'fruits-vegetables' } as any);
    mockedProductRepo.findBySlug.mockResolvedValue(null);
    mockedProductRepo.create.mockResolvedValue({ id: 42 } as any);

    await adminCatalogService.createProduct({
      category_id: 1,
      name: 'Organic Mangoes',
      slug: 'organic-mangoes',
      price: 120,
      mrp: 150,
      unit: '1 kg',
      image: 'https://example.com/mango.jpg',
    });

    expect(mockedProductRepo.create).toHaveBeenCalledWith(expect.objectContaining({
      thumbnail: 'https://example.com/mango.jpg',
    }));
  });
});
