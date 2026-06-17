import { Request, Response, NextFunction } from 'express';
import * as orderService from '../services/order.service';
import { success } from '../utils/response';

export async function createOrder(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await orderService.createOrder({
      ...req.body,
      ip: req.ip,
      ua: req.get('user-agent'),
    });
    res.json(success(result, '订单创建成功'));
  } catch (err) {
    next(err);
  }
}

export async function getOrderStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const orderNo = String(req.params.orderNo);
    const result = await orderService.getOrderStatus(orderNo);
    res.json(success(result));
  } catch (err) {
    next(err);
  }
}

export async function queryOrder(req: Request, res: Response, next: NextFunction) {
  try {
    const email = String(req.query.email || '');
    const order_no = req.query.order_no ? String(req.query.order_no) : '';
    const extract_password = req.query.extract_password ? String(req.query.extract_password) : undefined;
    const result = await orderService.queryOrder(email, order_no, extract_password);
    res.json(success(result));
  } catch (err) {
    next(err);
  }
}

export async function simulatePayment(req: Request, res: Response, next: NextFunction) {
  try {
    const { order_no } = req.body;
    const result = await orderService.simulatePayment(String(order_no));
    res.json(success(result, '支付模拟成功'));
  } catch (err) {
    next(err);
  }
}

export async function getAdminOrderList(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await orderService.getAdminOrderList(req.query);
    res.json(success(result));
  } catch (err) {
    next(err);
  }
}

export async function getOrderStatusByToken(req: Request, res: Response, next: NextFunction) {
  try {
    const token = String(req.params.token);
    const result = await orderService.getOrderStatusByToken(token);
    res.json(success(result));
  } catch (err) {
    next(err);
  }
}

export async function queryOrderByToken(req: Request, res: Response, next: NextFunction) {
  try {
    const token = String(req.query.token || '');
    const extract_password = req.query.extract_password ? String(req.query.extract_password) : undefined;
    const result = await orderService.queryOrderByToken(token, extract_password);
    res.json(success(result));
  } catch (err) {
    next(err);
  }
}

export async function simulatePaymentByToken(req: Request, res: Response, next: NextFunction) {
  try {
    const { token } = req.body;
    const result = await orderService.simulatePaymentByToken(String(token));
    res.json(success(result, '支付模拟成功'));
  } catch (err) {
    next(err);
  }
}
