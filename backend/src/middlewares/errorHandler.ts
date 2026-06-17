import { Request, Response, NextFunction } from 'express';
import { error } from '../utils/response';
import { logger } from '../utils/logger';

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json(error('接口不存在', 404));
}

export function errorHandler(err: any, req: Request, res: Response, _next: NextFunction) {
  const statusCode = err.statusCode || 400;
  const message = err.message || '服务器内部错误';

  if (statusCode >= 500) {
    logger.error('Server error', {
      message: err.message,
      stack: err.stack,
      url: req.originalUrl,
      method: req.method,
    });
    res.status(500).json(error('服务器内部错误', 500));
  } else {
    res.status(statusCode).json(error(message, statusCode));
  }
}
