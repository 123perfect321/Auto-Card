import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { error } from '../utils/response';

export interface AuthRequest extends Request {
  adminId?: number;
  adminRole?: string;
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json(error('未授权，请先登录', 401));
    return;
  }

  const token = authHeader.substring(7);
  try {
    const decoded = jwt.verify(token, config.jwt.secret) as { id: number; role: string };
    req.adminId = decoded.id;
    req.adminRole = decoded.role;
    next();
  } catch (err) {
    res.status(401).json(error('Token 无效或已过期', 401));
  }
}
