import { getSetting } from './setting.service';
import { fulfillOrderByToken } from './order.service';
import { buildGatewayUrl, buildEpaySign, verifyEpaySign, mapPayType } from '../utils/epay';
import { logger } from '../utils/logger';

interface EpayConfig {
  pid: string;
  key: string;
  gateway: string;
}

async function getEpayConfig(): Promise<EpayConfig> {
  const s = await getSetting('epay_pid');
  const pid = String(s || '').trim();
  const key = String((await getSetting('epay_key')) || '').trim();
  const gateway = String((await getSetting('epay_gateway')) || '').trim();

  if (!pid || !key || !gateway) {
    throw new Error('易支付配置不完整：请在后台「系统设置 → 支付配置」填写商户 ID / 密钥 / 网关地址');
  }
  return { pid, key, gateway };
}

function buildCallbackUrl(path: string): string {
  const base = String(process.env.SITE_URL || '').replace(/\/+$/, '');
  if (!base) {
    throw new Error('请在 .env 中配置 SITE_URL（公网根地址，例如 https://yourdomain.com）');
  }
  return `${base}${path}`;
}

export async function createPayment(params: {
  orderToken: string;
  orderNo: string;
  amount: number;
  method: string;
  subject: string;
  email: string;
  clientIp?: string;
}) {
  const cfg = await getEpayConfig();
  const payType = mapPayType(params.method);
  const amount = Number(params.amount).toFixed(2);

  const url = buildGatewayUrl(
    {
      pid: cfg.pid,
      key: cfg.key,
      gateway: cfg.gateway,
      notifyUrl: buildCallbackUrl('/api/payments/notify'),
      returnUrl: buildCallbackUrl('/api/payments/return'),
    },
    {
      tradeNo: params.orderNo,
      amount,
      name: params.subject,
      payType,
      clientIp: params.clientIp || '',
    },
  );

  logger.info('epay: gateway url built', { orderNo: params.orderNo, payType, amount });

  return {
    order_no: params.orderNo,
    method: payType,
    amount,
    payment_url: url,
  };
}

export async function handlePaymentCallback(query: Record<string, any>) {
  const cfg = await getEpayConfig();

  if (!verifyEpaySign(query, cfg.key)) {
    logger.warn('epay: signature verify failed', { query });
    return { verified: false };
  }

  const { trade_status, trade_no, out_trade_no } = query;
  if (String(trade_status) !== 'TRADE_SUCCESS') {
    logger.info('epay: non-success status', { trade_status, out_trade_no });
    return { verified: true, trade_status };
  }

  const result = await fulfillOrderByToken(String(out_trade_no), String(trade_no));
  logger.info('epay: order fulfilled', { out_trade_no, trade_no, ...result });
  return { verified: true, result, orderToken: result.orderToken || String(out_trade_no) };
}

export async function testPaymentConnection(): Promise<{ success: boolean; message: string; detail?: any }> {
  try {
    const cfg = await getEpayConfig();
    const probe: Record<string, any> = {
      pid: cfg.pid,
      key: cfg.key,
      out_trade_no: `PROBE${Date.now()}`,
      notify_url: 'http://localhost/probe',
      return_url: 'http://localhost/probe',
      name: 'connection_probe',
      money: '0.01',
      type: 'alipay',
    };
    probe.sign = buildEpaySign(probe, cfg.key);
    probe.sign_type = 'MD5';

    const gateway = cfg.gateway.replace(/\/+$/, '');
    const url = `${gateway}/submit.php?${Object.entries(probe)
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join('&')}`;

    return {
      success: true,
      message: `易支付网关可达：${gateway}`,
      detail: { pid: cfg.pid, gateway: cfg.gateway, sampleUrl: url.substring(0, 200) + '...' },
    };
  } catch (e: any) {
    return { success: false, message: e.message || '连接失败' };
  }
}
