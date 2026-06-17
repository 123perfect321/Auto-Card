import rateLimit from 'express-rate-limit';

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { code: 429, msg: '登录尝试过于频繁，请15分钟后再试', data: null },
  skipSuccessfulRequests: false,
});

export const orderLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { code: 429, msg: '下单过于频繁，请稍后再试', data: null },
});

export const paymentSimLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { code: 429, msg: '操作过于频繁，请稍后再试', data: null },
});

export const queryLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { code: 429, msg: '查询过于频繁，请稍后再试', data: null },
});
