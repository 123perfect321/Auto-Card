import { Request, Response, NextFunction } from 'express';
import * as paymentService from '../services/payment.service';
import { success } from '../utils/response';

export async function createPayment(req: Request, res: Response, next: NextFunction) {
  try {
    const { order_no, method, amount } = req.body;
    const result = await paymentService.createPayment(order_no, method, amount);
    res.json(success(result));
  } catch (err) {
    next(err);
  }
}

export async function handleCallback(req: Request, res: Response, next: NextFunction) {
  try {
    const method = String(req.params.method);
    const result = await paymentService.handlePaymentCallback(method, req.body);
    res.json(success(result));
  } catch (err) {
    next(err);
  }
}

export async function testPayment(req: Request, res: Response, next: NextFunction) {
  try {
    const { method } = req.body;
    const result = await paymentService.testPaymentConnection(method);
    res.json(success(result));
  } catch (err) {
    next(err);
  }
}
