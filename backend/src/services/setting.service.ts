import prisma from '../config/database';

export async function getSettings() {
  const settings = await prisma.setting.findMany();
  const result: Record<string, any> = {};
  for (const s of settings) {
    try {
      result[s.k] = JSON.parse(s.v);
    } catch {
      result[s.k] = s.v;
    }
  }
  return result;
}

export async function updateSettings(data: Record<string, any>) {
  for (const [k, v] of Object.entries(data)) {
    const value = typeof v === 'object' ? JSON.stringify(v) : String(v);
    await prisma.setting.upsert({
      where: { k },
      create: { k, v: value },
      update: { v: value },
    });
  }
}

export async function getSetting(key: string) {
  const setting = await prisma.setting.findUnique({ where: { k: key } });
  if (!setting) return null;
  try {
    return JSON.parse(setting.v);
  } catch {
    return setting.v;
  }
}
