import { Request, Response, NextFunction } from 'express';
import * as paymentService from '../services/payment.service';
import { success } from '../utils/response';
import { logger } from '../utils/logger';

export async function createPayment(req: Request, res: Response, next: NextFunction) {
  try {
    const { order_token, order_no, method, amount, subject, email } = req.body;
    if (!order_token || !order_no) {
      res.status(400).json({ code: 400, msg: '缺少 order_token / order_no', data: null });
      return;
    }
    const result = await paymentService.createPayment({
      orderToken: order_token,
      orderNo: order_no,
      amount: Number(amount),
      method: method || 'alipay',
      subject: subject || '自动发卡',
      email: email || '',
      clientIp: req.ip,
    });
    res.json(success(result));
  } catch (err) {
    next(err);
  }
}

// 易支付异步通知（POST/GET） — 必须返回纯文本 "success" 或 "fail"
// 即使内部异常也必须返回 "fail"，不能返回 JSON，否则网关会一直重试
export async function handleNotify(req: Request, res: Response, _next: NextFunction) {
  try {
    const result = await paymentService.handlePaymentCallback(req.query as Record<string, any>);
    res.send(result.verified ? 'success' : 'fail');
  } catch (err: any) {
    logger.warn('epay notify error', { err: err.message, query: req.query });
    res.status(200).send('fail');
  }
}

// 易支付同步回调（GET） — 跳回买家浏览器
export async function handleReturn(req: Request, res: Response, _next: NextFunction) {
  try {
    const result = await paymentService.handlePaymentCallback(req.query as Record<string, any>);
    const orderToken = result.orderToken || String((req.query as any).out_trade_no || '');
    if (result.verified && orderToken) {
      res.redirect(302, `/success/${encodeURIComponent(orderToken)}`);
    } else {
      res.redirect(302, `/query`);
    }
  } catch (err: any) {
    logger.warn('epay return error', { err: err.message, query: req.query });
    res.redirect(302, `/query`);
  }
}

export async function testPayment(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await paymentService.testPaymentConnection();
    res.json(success(result));
  } catch (err) {
    next(err);
  }
}
