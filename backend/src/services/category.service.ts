import prisma from '../config/database';
import { Prisma } from '@prisma/client';

export async function getCategories() {
  const categories = await prisma.category.findMany({
    where: { status: 1 },
    orderBy: { sort: 'asc' },
    include: { _count: { select: { products: { where: { status: 1, deletedAt: null } } } } },
  });
  return categories.map(c => ({
    id: c.id,
    name: c.name,
    icon: c.icon,
    sort: c.sort,
    product_count: c._count.products,
  }));
}

export async function getAllCategories() {
  return prisma.category.findMany({ orderBy: { sort: 'asc' } });
}

export async function createCategory(data: { name: string; icon?: string; sort?: number }) {
  return prisma.category.create({ data });
}

export async function updateCategory(id: number, data: { name?: string; icon?: string; sort?: number; status?: number }) {
  return prisma.category.update({ where: { id }, data });
}

export async function deleteCategory(id: number) {
  const count = await prisma.product.count({ where: { categoryId: id, deletedAt: null } });
  if (count > 0) throw new Error('该分类下还有商品，无法删除');
  return prisma.category.delete({ where: { id } });
}
