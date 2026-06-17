import prisma from '../config/database';
import { encrypt, decrypt } from '../utils/crypto';

export async function importCards(productId: number, specId: number, cards: string[]) {
  if (!cards || cards.length === 0) throw new Error('卡密列表不能为空');
  if (cards.length > 5000) throw new Error('单次导入卡密不能超过5000条');

  let imported = 0;
  let skipped = 0;

  for (const content of cards) {
    const trimmed = content.trim();
    if (!trimmed) continue;

    try {
      await prisma.card.create({
        data: {
          productId,
          specId,
          content: encrypt(trimmed),
          status: 1,
        },
      });
      imported++;
    } catch (err: any) {
      if (err.code === 'P2002') {
        skipped++;
      } else {
        throw err;
      }
    }
  }

  await prisma.productSpec.update({
    where: { id: specId },
    data: { stock: { increment: imported } },
  });

  return { imported, skipped, total: cards.length };
}

export async function assignCard(productId: number, specId: number, orderId: number): Promise<string | null> {
  const card = await prisma.$transaction(async (tx) => {
    const available = await tx.card.findFirst({
      where: { productId, specId, status: 1 },
      orderBy: { createdAt: 'asc' },
    });

    if (!available) return null;

    const updated = await tx.card.update({
      where: { id: available.id },
      data: {
        status: 2,
        orderId,
        soldAt: new Date(),
      },
    });

    await tx.productSpec.update({
      where: { id: specId },
      data: {
        stock: { decrement: 1 },
        sold: { increment: 1 },
      },
    });

    return updated;
  });

  if (!card) return null;
  return decrypt(card.content);
}

export async function getCardList(productId?: number, specId?: number, status?: number, page = 1, pageSize = 20) {
  const where: any = {};
  if (productId) where.productId = productId;
  if (specId) where.specId = specId;
  if (status) where.status = status;

  const [list, total] = await Promise.all([
    prisma.card.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        product: { select: { id: true, name: true } },
        spec: { select: { id: true, name: true } },
      },
    }),
    prisma.card.count({ where }),
  ]);

  const decrypted = list.map(c => ({
    ...c,
    content: decrypt(c.content),
  }));

  return { list: decrypted, total, page, page_size: pageSize };
}

export async function invalidateCard(cardId: number) {
  const card = await prisma.card.findUnique({ where: { id: cardId } });
  if (!card) throw new Error('卡密不存在');
  if (card.status === 2) throw new Error('已售卡密无法作废');

  await prisma.card.update({
    where: { id: cardId },
    data: { status: 4 },
  });
}

export async function getCardStats() {
  const [total, available, sold, voided] = await Promise.all([
    prisma.card.count(),
    prisma.card.count({ where: { status: 1 } }),
    prisma.card.count({ where: { status: 2 } }),
    prisma.card.count({ where: { status: 4 } }),
  ]);

  return { total, available, sold, voided };
}

export async function clearSpecCards(specId: number) {
  const spec = await prisma.productSpec.findUnique({ where: { id: specId } });
  if (!spec) throw new Error('规格不存在');

  const availableCards = await prisma.card.count({
    where: { specId, status: 1 },
  });

  await prisma.card.deleteMany({
    where: { specId, status: 1 },
  });

  await prisma.productSpec.update({
    where: { id: specId },
    data: { stock: { decrement: availableCards } },
  });

  return { cleared: availableCards };
}

export async function clearProductCards(productId: number) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { specs: true },
  });
  if (!product) throw new Error('商品不存在');

  let totalCleared = 0;
  for (const spec of product.specs) {
    const available = await prisma.card.count({
      where: { specId: spec.id, status: 1 },
    });

    await prisma.card.deleteMany({
      where: { specId: spec.id, status: 1 },
    });

    await prisma.productSpec.update({
      where: { id: spec.id },
      data: { stock: { decrement: available } },
    });

    totalCleared += available;
  }

  return { cleared: totalCleared };
}
