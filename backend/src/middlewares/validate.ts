import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';
import { error } from '../utils/response';

export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const messages = result.error.errors.map(e => e.message).join(', ');
      res.status(400).json(error(`参数校验失败: ${messages}`, 400));
      return;
    }
    req.body = result.data;
    next();
  };
}

export const loginSchema = z.object({
  username: z.string().min(1, '用户名不能为空'),
  password: z.string().min(1, '密码不能为空'),
});

export const createOrderSchema = z.object({
  items: z.array(z.object({
    product_id: z.number(),
    spec_id: z.number(),
    quantity: z.number().int().min(1),
  })).min(1, '至少需要一个商品'),
  email: z.string().email('邮箱格式不正确'),
  coupon_code: z.string().optional(),
  payment_method: z.enum(['wechat', 'alipay', 'usdt']),
  remark: z.string().optional(),
});

export const queryOrderSchema = z.object({
  email: z.string().email('邮箱格式不正确'),
  order_no: z.string().min(1, '订单号不能为空'),
});

export const importCardSchema = z.object({
  product_id: z.number(),
  spec_id: z.number(),
  cards: z.array(z.string().min(1).max(512)).min(1, '至少需要一张卡密'),
});
