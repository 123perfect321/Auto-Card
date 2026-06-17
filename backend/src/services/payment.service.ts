import { logger } from '../utils/logger';

export async function createPayment(orderNo: string, method: string, amount: number) {
  logger.info(`Payment created (stub): ${orderNo}`, { method, amount });
  return {
    order_no: orderNo,
    method,
    amount,
    qr_code: `mock-qr-code-${orderNo}`,
    payment_url: `mock-payment-url-${orderNo}`,
  };
}

export async function handlePaymentCallback(method: string, body: any) {
  logger.info(`Payment callback received (stub): ${method}`, body);
  return { success: true };
}

export async function testPaymentConnection(method: string) {
  logger.info(`Testing payment connection (stub): ${method}`);
  return { success: true, message: `${method} 连接测试成功（模拟）` };
}
