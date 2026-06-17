import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { encrypt } from '../src/utils/crypto';

const prisma = new PrismaClient();

function rand4(): string {
  return String(Math.floor(Math.random() * 10000)).padStart(4, '0');
}

async function main() {
  const adminPassword = await bcrypt.hash('admin123456', 10);

  await prisma.admin.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: adminPassword,
      email: 'admin@example.com',
      status: 1,
    },
  });

  const categories = [
    { name: '游戏充值', icon: '🎮', sort: 1 },
    { name: '影视会员', icon: '🎬', sort: 2 },
    { name: '音乐会员', icon: '🎵', sort: 3 },
    { name: '云服务', icon: '☁️', sort: 4 },
    { name: 'AI工具', icon: '🤖', sort: 5 },
    { name: '其他', icon: '📦', sort: 6 },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: cat,
    });
  }

  const categoryRecords = await prisma.category.findMany();
  const categoryMap = new Map(categoryRecords.map(c => [c.name, c.id]));

  function makeCover(emoji: string, bg1: string, bg2: string): string {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
      <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="${bg1}"/><stop offset="100%" stop-color="${bg2}"/></linearGradient></defs>
      <rect width="400" height="300" fill="url(#g)"/>
      <text x="200" y="170" text-anchor="middle" font-size="100">${emoji}</text>
    </svg>`;
    return 'data:image/svg+xml,' + encodeURIComponent(svg);
  }

  const products = [
    {
      name: 'Netflix 会员月卡',
      categoryId: categoryMap.get('影视会员')!,
      description: '全网最低价 Netflix 会员，支持4K画质，全设备通用',
      cover: makeCover('🎬', '#E50914', '#830519'),
      minPrice: 25,
      maxPrice: 45,
      status: 1,
      viewCount: 0,
      specs: [
        { name: '1个月', price: 25, stock: 100 },
        { name: '3个月', price: 68, stock: 50 },
        { name: '12个月', price: 238, stock: 20 },
      ],
    },
    {
      name: 'Spotify Premium 季卡',
      categoryId: categoryMap.get('音乐会员')!,
      description: 'Spotify 高级会员，无广告畅听千万曲库',
      cover: makeCover('🎵', '#1DB954', '#0D6E32'),
      minPrice: 35,
      maxPrice: 98,
      status: 1,
      viewCount: 0,
      specs: [
        { name: '1个月', price: 35, stock: 80 },
        { name: '3个月', price: 98, stock: 30 },
      ],
    },
    {
      name: 'ChatGPT Plus 月卡',
      categoryId: categoryMap.get('AI工具')!,
      description: 'ChatGPT Plus 会员，GPT-4 无限制使用',
      cover: makeCover('🤖', '#10A37F', '#0A6E55'),
      minPrice: 98,
      maxPrice: 268,
      status: 1,
      viewCount: 0,
      specs: [
        { name: '1个月', price: 98, stock: 50 },
        { name: '3个月', price: 268, stock: 20 },
      ],
    },
    {
      name: 'YouTube Premium 年卡',
      categoryId: categoryMap.get('影视会员')!,
      description: 'YouTube Premium 年费会员，无广告+YouTube Music',
      cover: makeCover('▶️', '#FF0000', '#990000'),
      minPrice: 58,
      maxPrice: 588,
      status: 1,
      viewCount: 0,
      specs: [
        { name: '1个月', price: 58, stock: 60 },
        { name: '12个月', price: 588, stock: 15 },
      ],
    },
    {
      name: 'Steam 充值卡 $10',
      categoryId: categoryMap.get('游戏充值')!,
      description: 'Steam 钱包充值卡，即时到账，全球通用',
      cover: makeCover('🎮', '#1B2838', '#2A475D'),
      minPrice: 72,
      maxPrice: 72,
      status: 1,
      viewCount: 0,
      specs: [
        { name: '$10', price: 72, stock: 200 },
      ],
    },
    {
      name: 'iCloud 存储 200GB',
      categoryId: categoryMap.get('云服务')!,
      description: 'Apple iCloud 云存储 200GB 扩容',
      cover: makeCover('☁️', '#3B82F6', '#1D4ED8'),
      minPrice: 21,
      maxPrice: 218,
      status: 1,
      viewCount: 0,
      specs: [
        { name: '1个月', price: 21, stock: 100 },
        { name: '12个月', price: 218, stock: 30 },
      ],
    },
  ];

  const cardsPerSpec = 8;

  for (const product of products) {
    const { specs, ...productData } = product;
    const created = await prisma.product.create({ data: productData });

    for (const spec of specs) {
      await prisma.productSpec.create({
        data: {
          productId: created.id,
          name: spec.name,
          price: spec.price,
          stock: cardsPerSpec,
          sold: 0,
        },
      });
    }
  }

  const allProducts = await prisma.product.findMany({ include: { specs: true } });

  const cardTemplates: Record<string, () => string> = {
    'Netflix': () => `NETFLIX-${rand4()}-${rand4()}-${rand4()}`,
    'Spotify': () => `SPOTIFY-${rand4()}-${rand4()}`,
    'ChatGPT': () => `GPT-${rand4()}-${rand4()}-${rand4()}`,
    'YouTube': () => `YT-PREM-${rand4()}-${rand4()}-${rand4()}`,
    'Steam': () => `STEAM-${rand4()}-${rand4()}-${rand4()}`,
    'iCloud': () => `ICLOUD-${rand4()}-${rand4()}`,
  };

  for (const product of allProducts) {
    for (const spec of product.specs) {
      const templateKey = Object.keys(cardTemplates).find(k => product.name.includes(k));
      const gen = templateKey ? cardTemplates[templateKey] : () => `CARD-${rand4()}-${rand4()}`;

      for (let i = 0; i < cardsPerSpec; i++) {
        await prisma.card.create({
          data: {
            productId: product.id,
            specId: spec.id,
            content: encrypt(gen()),
            status: 1,
          },
        });
      }
    }
  }

  console.log('Seed data created successfully');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
