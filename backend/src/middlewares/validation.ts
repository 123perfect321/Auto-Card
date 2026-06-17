import { Request, Response, NextFunction } from 'express';

type ValidationRule = {
  field: string;
  type: 'string' | 'number' | 'email' | 'array' | 'boolean';
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  message?: string;
};

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validate(rules: ValidationRule[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const errors: string[] = [];

    for (const rule of rules) {
      const value = req.body[rule.field];

      if (rule.required && (value === undefined || value === null || value === '')) {
        errors.push(rule.message || `${rule.field} 不能为空`);
        continue;
      }

      if (value === undefined || value === null) continue;

      switch (rule.type) {
        case 'string':
          if (typeof value !== 'string') {
            errors.push(`${rule.field} 必须是字符串`);
            continue;
          }
          if (rule.minLength && value.length < rule.minLength) {
            errors.push(rule.message || `${rule.field} 长度不能少于 ${rule.minLength}`);
          }
          if (rule.maxLength && value.length > rule.maxLength) {
            errors.push(rule.message || `${rule.field} 长度不能超过 ${rule.maxLength}`);
          }
          if (rule.pattern && !rule.pattern.test(value)) {
            errors.push(rule.message || `${rule.field} 格式不正确`);
          }
          break;

        case 'email':
          if (typeof value !== 'string' || !validateEmail(value)) {
            errors.push(rule.message || '邮箱格式不正确');
          }
          if (typeof value === 'string' && rule.maxLength && value.length > rule.maxLength) {
            errors.push(rule.message || `邮箱长度不能超过 ${rule.maxLength}`);
          }
          break;

        case 'number':
          const num = Number(value);
          if (isNaN(num)) {
            errors.push(`${rule.field} 必须是数字`);
            continue;
          }
          if (rule.min !== undefined && num < rule.min) {
            errors.push(rule.message || `${rule.field} 不能小于 ${rule.min}`);
          }
          if (rule.max !== undefined && num > rule.max) {
            errors.push(rule.message || `${rule.field} 不能大于 ${rule.max}`);
          }
          break;

        case 'array':
          if (!Array.isArray(value)) {
            errors.push(`${rule.field} 必须是数组`);
            continue;
          }
          if (rule.minLength && value.length < rule.minLength) {
            errors.push(rule.message || `${rule.field} 至少需要 ${rule.minLength} 项`);
          }
          if (rule.maxLength && value.length > rule.maxLength) {
            errors.push(rule.message || `${rule.field} 最多 ${rule.maxLength} 项`);
          }
          break;
      }
    }

    if (errors.length > 0) {
      res.status(400).json({ code: 400, msg: errors[0], data: null });
      return;
    }

    next();
  };
}

export const loginValidation = validate([
  { field: 'username', type: 'string', required: true, minLength: 3, maxLength: 32 },
  { field: 'password', type: 'string', required: true, minLength: 6, maxLength: 128 },
]);

export const changePasswordValidation = validate([
  { field: 'oldPassword', type: 'string', required: true, minLength: 6 },
  { field: 'newPassword', type: 'string', required: true, minLength: 8, maxLength: 128 },
]);

export const createOrderValidation = validate([
  { field: 'email', type: 'email', required: true, maxLength: 255 },
  { field: 'items', type: 'array', required: true, minLength: 1, maxLength: 50 },
  { field: 'payment_method', type: 'string', required: true },
]);

export const queryOrderValidation = (req: Request, res: Response, next: NextFunction) => {
  const email = String(req.query.email || '');
  const order_no = String(req.query.order_no || '');

  if (!email || !validateEmail(email)) {
    res.status(400).json({ code: 400, msg: '邮箱格式不正确', data: null });
    return;
  }

  if (order_no && !/^ORD\d{14}$/.test(order_no)) {
    res.status(400).json({ code: 400, msg: '订单号格式不正确', data: null });
    return;
  }

  next();
};

export const orderNoParamValidation = (req: Request, res: Response, next: NextFunction) => {
  const orderNo = String(req.params.orderNo);
  if (!orderNo || !/^ORD\d{14}$/.test(orderNo)) {
    res.status(400).json({ code: 400, msg: '订单号格式不正确', data: null });
    return;
  }
  next();
};

export default validate;
