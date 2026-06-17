import { Response, NextFunction } from 'express';
import * as authService from '../services/auth.service';
import { success } from '../utils/response';
import { AuthRequest } from '../middlewares/auth.middleware';

export async function login(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { username, password } = req.body;
    const result = await authService.login(username, password, req.ip);
    res.json(success(result));
  } catch (err) {
    next(err);
  }
}

export async function getAdminInfo(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await authService.getAdminInfo(req.adminId!);
    res.json(success(result));
  } catch (err) {
    next(err);
  }
}

export async function changePassword(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { oldPassword, newPassword } = req.body;
    await authService.changePassword(req.adminId!, oldPassword, newPassword);
    res.json(success(null, '密码修改成功'));
  } catch (err) {
    next(err);
  }
}
