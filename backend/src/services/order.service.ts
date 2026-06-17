import prisma from '../config/database';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { generateOrderNo } from '../utils/orderNo';
import { decrypt } from '../utils/crypto';
import { assignCard } from './card.service';
import { sendCardEmail } from './mail.service';
import { logger } from '../utils/logger';

interface CreateOrderParams {
  items: Array<{ product_id: number; spec_id: number; quantity: number }>;
  email: string;
  payment_method: string;
  coupon_code?: string;
  extract_password?: string;
  remark?: string;
  ip?: string;
  ua?: string;
}

function generateToken(): string {
  return crypto.randomBytes(16).toString('hex');
}

export async function createOrder(params: CreateOrderParams) {
  const { items, email, payment_method, ip, ua, extract_password } = params;

  if (!items || items.length === 0) throw new Error('商品列表不能为空');
  if (items.length > 50) throw new Error('单次下单商品数量不能超过50');

  const allowedMethods = ['alipay', 'wechat', 'usdt'];
  if (!allowedMethods.includes(payment_method)) {
    throw new Error('不支持的支付方式');
  }

  for (const item of items) {
    const pid = Number(item.product_id);
    const sid = Number(item.spec_id);
    const qty = Number(item.quantity);
    if (isNaN(pid) || pid <= 0) throw new Error('商品ID无效');
    if (isNaN(sid) || sid <= 0) throw new Error('规格ID无效');
    if (isNaN(qty) || qty < 1 || qty > 100) throw new Error('商品数量必须在1-100之间');
    item.product_id = pid;
    item.spec_id = sid;
    item.quantity = qty;
  }

  const orderNo = generateOrderNo();
  const orderToken = generateToken();
  const expiredAt = new Date(Date.now() + 30 * 60 * 1000);

  let totalAmount = 0;
  const orderItems = [];

  for (const item of items) {
    const spec = await prisma.productSpec.findUnique({
      where: { id: item.spec_id },
      include: { product: true },
    });

    if (!spec || spec.product.status !== 1) {
      throw new Error(`商品 ${item.product_id} 不存在或已下架`);
    }

    const availableCards = await prisma.card.count({
      where: { specId: item.spec_id, status: 1 },
    });

    if (availableCards < item.quantity) {
      throw new Error(`商品 ${spec.product.name} (${spec.name}) 库存不足`);
    }

    const subtotal = Number(spec.price) * item.quantity;
    totalAmount += subtotal;

    orderItems.push({
      productId: item.product_id,
      specId: item.spec_id,
      productName: spec.product.name,
      specName: spec.name,
      price: spec.price,
      quantity: item.quantity,
      subtotal,
    });
  }

  let discountAmount = 0;
  if (params.coupon_code) {
    const coupon = await prisma.coupon.findFirst({
      where: { code: params.coupon_code, status: 1 },
    });
    if (coupon && coupon.usedQuota < coupon.totalQuota && coupon.expiresAt > new Date()) {
      if (totalAmount >= Number(coupon.minAmount)) {
        if (coupon.type === 1) {
          discountAmount = Number(coupon.value);
        } else if (coupon.type === 2) {
          discountAmount = totalAmount * (Number(coupon.value) / 100);
        }
      }
    }
  }

  const payAmount = Math.max(0, totalAmount - discountAmount);

  let hashedPassword: string | null = null;
  let useExtractPassword = 0;
  if (extract_password && extract_password.length >= 4) {
    hashedPassword = await bcrypt.hash(extract_password, 10);
    useExtractPassword = 1;
  }

  const order = await prisma.order.create({
    data: {
      orderNo,
      orderToken,
      buyerEmail: email,
      totalAmount,
      payAmount,
      discountAmount,
      paymentMethod: payment_method,
      status: 0,
      expiredAt,
      buyerIp: ip,
      buyerUa: ua,
      useExtractPassword,
      extractPassword: hashedPassword,
      items: { create: orderItems },
    },
    include: { items: true },
  });

  logger.info(`Order created: ${orderNo}`, { email, amount: payAmount });

  return {
    order_no: order.orderNo,
    token: order.orderToken,
    total_amount: Number(order.totalAmount),
    pay_amount: Number(order.payAmount),
    expire_at: order.expiredAt,
    items: order.items,
  };
}

export async function getOrderStatus(orderNo: string) {
  const order = await prisma.order.findUnique({ where: { orderNo } });
  if (!order) throw new Error('订单不存在');

  return {
    status: order.status,
    paid_at: order.paidAt,
    delivered_at: order.deliveredAt,
  };
}

export async function getOrderStatusByToken(token: string) {
  const order = await prisma.order.findUnique({ where: { orderToken: token } });
  if (!order) throw new Error('订单不存在');

  return {
    status: order.status,
    pay_amount: Number(order.payAmount),
    paid_at: order.paidAt,
    delivered_at: order.deliveredAt,
    use_extract_password: order.useExtractPassword,
  };
}

export async function queryOrder(email: string, orderNo: string, extractPassword?: string) {
  const where: any = { buyerEmail: email };
  if (orderNo) where.orderNo = orderNo;

  const order = await prisma.order.findFirst({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      items: true,
      cards: {
        where: { status: 2 },
        select: { content: true },
      },
    },
  });

  if (!order) throw new Error('订单信息不匹配');

  if (order.useExtractPassword === 1 && order.extractPassword) {
    if (!extractPassword) throw new Error('该订单设置了提取密码，请输入提取密码');
    const valid = await bcrypt.compare(extractPassword, order.extractPassword);
    if (!valid) throw new Error('提取密码错误');
  }

  const cards = order.cards.map(c => {
    try {
      return decrypt(c.content);
    } catch {
      return '****';
    }
  });

  return {
    order_no: order.orderNo,
    status: order.status,
    items: order.items,
    cards,
    use_extract_password: order.useExtractPassword,
    total_amount: Number(order.totalAmount),
    pay_amount: Number(order.payAmount),
    paid_at: order.paidAt,
    created_at: order.createdAt,
  };
}

export async function queryOrderByToken(token: string, extractPassword?: string) {
  const order = await prisma.order.findUnique({
    where: { orderToken: token },
    include: {
      items: true,
      cards: {
        where: { status: 2 },
        select: { content: true },
      },
    },
  });

  if (!order) throw new Error('订单不存在');

  if (order.useExtractPassword === 1 && order.extractPassword) {
    if (!extractPassword) throw new Error('该订单设置了提取密码，请输入提取密码');
    const valid = await bcrypt.compare(extractPassword, order.extractPassword);
    if (!valid) throw new Error('提取密码错误');
  }

  const cards = order.cards.map(c => {
    try {
      return decrypt(c.content);
    } catch {
      return '****';
    }
  });

  return {
    order_no: order.orderNo,
    status: order.status,
    items: order.items,
    cards,
    use_extract_password: order.useExtractPassword,
    total_amount: Number(order.totalAmount),
    pay_amount: Number(order.payAmount),
    paid_at: order.paidAt,
    created_at: order.createdAt,
  };
}

export async function simulatePayment(orderNo: string) {
  const order = await prisma.order.findUnique({
    where: { orderNo },
    include: { items: true },
  });

  if (!order) throw new Error('订单不存在');
  if (order.status !== 0) throw new Error('订单状态异常');
  if (order.expiredAt < new Date()) throw new Error('订单已过期');

  await prisma.order.update({
    where: { orderNo },
    data: {
      status: 1,
      paidAt: new Date(),
      paymentTradeNo: `SIM${Date.now()}`,
    },
  });

  const cards: string[] = [];
  for (const item of order.items) {
    for (let i = 0; i < item.quantity; i++) {
      const card = await assignCard(item.productId, item.specId, order.id);
      if (card) cards.push(card);
    }
  }

  if (cards.length > 0) {
    await prisma.order.update({
      where: { orderNo },
      data: { status: 2, deliveredAt: new Date() },
    });
    await sendCardEmail(order.buyerEmail, order.orderNo, cards);
  }

  logger.info(`Payment simulated: ${order.orderNo}`, { cards: cards.length });
  return { cards, delivered: cards.length > 0 };
}

export async function simulatePaymentByToken(token: string) {
  const order = await prisma.order.findUnique({
    where: { orderToken: token },
    include: { items: true },
  });

  if (!order) throw new Error('订单不存在');
  if (order.status !== 0) throw new Error('订单状态异常');
  if (order.expiredAt < new Date()) throw new Error('订单已过期');

  await prisma.order.update({
    where: { orderToken: token },
    data: {
      status: 1,
      paidAt: new Date(),
      paymentTradeNo: `SIM${Date.now()}`,
    },
  });

  const cards: string[] = [];
  for (const item of order.items) {
    for (let i = 0; i < item.quantity; i++) {
      const card = await assignCard(item.productId, item.specId, order.id);
      if (card) cards.push(card);
    }
  }

  if (cards.length > 0) {
    await prisma.order.update({
      where: { orderToken: token },
      data: { status: 2, deliveredAt: new Date() },
    });
    await sendCardEmail(order.buyerEmail, order.orderNo, cards);
  }

  logger.info(`Payment simulated: ${order.orderNo}`, { cards: cards.length });
  return { cards, delivered: cards.length > 0 };
}

export async function getAdminOrderList(params: any) {
  const { keyword, status, payment_method, page = 1, pageSize = 20 } = params;

  const pageNum = Number(page) || 1;
  const sizeNum = Number(pageSize) || 20;

  const where: any = {};
  if (keyword) {
    where.OR = [
      { orderNo: { contains: keyword } },
      { buyerEmail: { contains: keyword } },
    ];
  }
  if (status !== undefined && status !== null && status !== '') {
    const s = Number(status);
    if (!isNaN(s)) where.status = s;
  }
  if (payment_method) where.paymentMethod = payment_method;

  const [list, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (pageNum - 1) * sizeNum,
      take: sizeNum,
      include: {
        items: true,
        cards: {
          where: { status: 2 },
          select: { id: true, content: true },
        },
      },
    }),
    prisma.order.count({ where }),
  ]);

  const enrichedList = list.map(order => ({
    ...order,
    cards: order.cards.map(c => ({
      id: c.id,
      content: (() => { try { return decrypt(c.content); } catch { return '****'; } })(),
    })),
  }));

  return { list: enrichedList, total, page: pageNum, page_size: sizeNum };
}

export async function closeExpiredOrders() {
  const expired = await prisma.order.findMany({
    where: { status: 0, expiredAt: { lt: new Date() } },
  });

  for (const order of expired) {
    await prisma.order.update({
      where: { id: order.id },
      data: { status: 4 },
    });
    logger.info(`Order expired: ${order.orderNo}`);
  }

  return expired.length;
}
