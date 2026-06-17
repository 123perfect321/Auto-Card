import { Request, Response, NextFunction } from 'express';
import * as settingService from '../services/setting.service';
import { success } from '../utils/response';

export async function getSettings(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await settingService.getSettings();
    res.json(success(result));
  } catch (err) {
    next(err);
  }
}

export async function updateSettings(req: Request, res: Response, next: NextFunction) {
  try {
    await settingService.updateSettings(req.body);
    res.json(success(null, '设置已更新'));
  } catch (err) {
    next(err);
  }
}

export async function getSetting(req: Request, res: Response, next: NextFunction) {
  try {
    const key = String(req.params.key);
    const result = await settingService.getSetting(key);
    res.json(success(result));
  } catch (err) {
    next(err);
  }
}
