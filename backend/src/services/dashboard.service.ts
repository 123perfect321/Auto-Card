import prisma from '../config/database';

export async function getDashboardStats() {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

  const [
    todayOrders,
    todaySales,
    activeProducts,
    availableCards,
    totalOrders,
    totalSales,
  ] = await Promise.all([
    prisma.order.count({
      where: {
        createdAt: { gte: todayStart, lt: todayEnd },
        status: { in: [1, 2] },
      },
    }),
    prisma.order.aggregate({
      where: {
        createdAt: { gte: todayStart, lt: todayEnd },
        status: { in: [1, 2] },
      },
      _sum: { payAmount: true },
    }),
    prisma.product.count({ where: { status: 1, deletedAt: null } }),
    prisma.card.count({ where: { status: 1 } }),
    prisma.order.count({ where: { status: { in: [1, 2] } } }),
    prisma.order.aggregate({
      where: { status: { in: [1, 2] } },
      _sum: { payAmount: true },
    }),
  ]);

  const last7Days: { date: string; label: string; sales: number; orders: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const dayStart = new Date(todayStart.getTime() - i * 24 * 60 * 60 * 1000);
    const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
    const label = `${dayStart.getMonth() + 1}/${dayStart.getDate()}`;

    const [dayOrders, daySales] = await Promise.all([
      prisma.order.count({
        where: {
          createdAt: { gte: dayStart, lt: dayEnd },
          status: { in: [1, 2] },
        },
      }),
      prisma.order.aggregate({
        where: {
          createdAt: { gte: dayStart, lt: dayEnd },
          status: { in: [1, 2] },
        },
        _sum: { payAmount: true },
      }),
    ]);

    last7Days.push({
      date: dayStart.toISOString().slice(0, 10),
      label,
      sales: Number(daySales._sum.payAmount || 0),
      orders: dayOrders,
    });
  }

  return {
    today: {
      sales: Number(todaySales._sum.payAmount || 0),
      orders: todayOrders,
    },
    total: {
      sales: Number(totalSales._sum.payAmount || 0),
      orders: totalOrders,
    },
    activeProducts,
    availableCards,
    last7Days,
  };
}
