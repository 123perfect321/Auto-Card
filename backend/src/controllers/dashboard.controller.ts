import { Request, Response, NextFunction } from 'express';
import * as dashboardService from '../services/dashboard.service';
import { success } from '../utils/response';

export async function getDashboardStats(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await dashboardService.getDashboardStats();
    res.json(success(result));
  } catch (err) {
    next(err);
  }
}
