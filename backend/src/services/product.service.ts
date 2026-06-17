import prisma from '../config/database';
import { Prisma } from '@prisma/client';

interface ProductListParams {
  categoryId?: number;
  keyword?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  page?: number;
  pageSize?: number;
}

export async function getProductList(params: ProductListParams) {
  const { categoryId, keyword, sort, page = 1, pageSize = 12 } = params;

  const where: Prisma.ProductWhereInput = {
    deletedAt: null,
    status: 1,
    ...(categoryId ? { categoryId } : {}),
    ...(keyword ? { name: { contains: keyword } } : {}),
  };

  let orderBy: Prisma.ProductOrderByWithRelationInput = { sort: 'desc' };
  if (sort === 'sales') orderBy = { totalSold: 'desc' };
  else if (sort === 'price_asc') orderBy = { minPrice: 'asc' };
  else if (sort === 'price_desc') orderBy = { minPrice: 'desc' };
  else if (sort === 'newest') orderBy = { createdAt: 'desc' };

  const [list, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        specs: {
          orderBy: { sort: 'asc' },
          include: {
            _count: {
              select: { cards: { where: { status: 1 } } },
            },
          },
        },
        category: { select: { id: true, name: true } },
      },
    }),
    prisma.product.count({ where }),
  ]);

  const enriched = list.map(p => ({
    ...p,
    specs: p.specs.map(s => ({
      ...s,
      availableStock: s._count.cards,
    })),
  }));

  return { list: enriched, total, page, page_size: pageSize };
}

export async function getProductDetail(id: number) {
  const product = await prisma.product.findFirst({
    where: { id, deletedAt: null },
    include: {
      specs: {
        orderBy: { sort: 'asc' },
        include: {
          _count: {
            select: { cards: { where: { status: 1 } } },
          },
        },
      },
      category: { select: { id: true, name: true } },
    },
  });
  if (!product) throw new Error('商品不存在');

  await prisma.product.update({ where: { id }, data: { viewCount: { increment: 1 } } });

  const enriched = {
    ...product,
    specs: product.specs.map(s => ({
      ...s,
      availableStock: s._count.cards,
    })),
  };

  return enriched;
}

export async function getAdminProductList(params: ProductListParams & { status?: number }) {
  const { categoryId, keyword, status, page = 1, pageSize = 20 } = params;

  const where: Prisma.ProductWhereInput = {
    deletedAt: null,
    ...(categoryId ? { categoryId } : {}),
    ...(keyword ? { name: { contains: keyword } } : {}),
    ...(status !== undefined ? { status } : {}),
  };

  const [list, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: [{ sort: 'desc' }, { createdAt: 'desc' }],
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        specs: { orderBy: { sort: 'asc' } },
        category: { select: { id: true, name: true } },
      },
    }),
    prisma.product.count({ where }),
  ]);

  return { list, total, page, page_size: pageSize };
}

export async function createProduct(data: any) {
  const { specs, ...productData } = data;
  const prices = specs.map((s: any) => Number(s.price));
  productData.minPrice = Math.min(...prices);
  productData.maxPrice = Math.max(...prices);

  return prisma.product.create({
    data: {
      ...productData,
      cover: typeof productData.cover === 'object' ? JSON.stringify(productData.cover) : productData.cover,
      specs: { create: specs },
    },
    include: { specs: true },
  });
}

export async function updateProduct(id: number, data: any) {
  const { specs, ...productData } = data;

  if (specs) {
    const prices = specs.filter((s: any) => !s._delete).map((s: any) => Number(s.price));
    if (prices.length > 0) {
      productData.minPrice = Math.min(...prices);
      productData.maxPrice = Math.max(...prices);
    }
  }

  return prisma.$transaction(async (tx) => {
    const product = await tx.product.update({
      where: { id },
      data: {
        ...productData,
        cover: typeof productData.cover === 'object' ? JSON.stringify(productData.cover) : productData.cover,
      },
    });

    if (specs) {
      for (const spec of specs) {
        if (spec._delete && spec.id) {
          await tx.productSpec.delete({ where: { id: spec.id } });
        } else if (spec.id) {
          await tx.productSpec.update({ where: { id: spec.id }, data: spec });
        } else {
          await tx.productSpec.create({ data: { ...spec, productId: id } });
        }
      }
    }

    return product;
  });
}

export async function deleteProduct(id: number) {
  return prisma.product.update({
    where: { id },
    data: { deletedAt: new Date(), status: 0 },
  });
}

export async function toggleProductStatus(id: number) {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) throw new Error('商品不存在');
  const newStatus = product.status === 1 ? 0 : 1;
  return prisma.product.update({ where: { id }, data: { status: newStatus } });
}
