import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/database';
import { config } from '../config';
import { logger } from '../utils/logger';

export async function login(username: string, password: string, ip?: string) {
  const admin = await prisma.admin.findUnique({ where: { username } });
  if (!admin) {
    throw new Error('账号或密码错误');
  }
  if (admin.status !== 1) {
    throw new Error('账号已被禁用');
  }

  const valid = await bcrypt.compare(password, admin.password);
  if (!valid) {
    throw new Error('账号或密码错误');
  }

  const token = jwt.sign(
    { id: admin.id, username: admin.username, role: admin.role },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn } as jwt.SignOptions
  );

  await prisma.admin.update({
    where: { id: admin.id },
    data: { lastLoginAt: new Date(), lastLoginIp: ip },
  });

  logger.info(`Admin login: ${username}`, { ip });

  return {
    token,
    admin: {
      id: admin.id,
      username: admin.username,
      nickname: admin.nickname,
      avatar: admin.avatar,
      role: admin.role,
    },
  };
}

export async function getAdminInfo(adminId: number) {
  const admin = await prisma.admin.findUnique({
    where: { id: adminId },
    select: { id: true, username: true, nickname: true, avatar: true, email: true, role: true },
  });
  if (!admin) throw new Error('管理员不存在');
  return admin;
}

export async function changePassword(adminId: number, oldPassword: string, newPassword: string) {
  if (!oldPassword || !newPassword) throw new Error('密码不能为空');
  if (newPassword.length < 8) throw new Error('新密码长度不能少于8位');
  if (newPassword.length > 128) throw new Error('新密码长度不能超过128位');
  if (oldPassword === newPassword) throw new Error('新密码不能与原密码相同');

  const admin = await prisma.admin.findUnique({ where: { id: adminId } });
  if (!admin) throw new Error('管理员不存在');

  const valid = await bcrypt.compare(oldPassword, admin.password);
  if (!valid) throw new Error('原密码错误');

  const hashed = await bcrypt.hash(newPassword, 12);
  await prisma.admin.update({ where: { id: adminId }, data: { password: hashed } });
}
