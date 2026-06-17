import crypto from 'crypto';

export interface EpayConfig {
  pid: number | string;
  key: string;
  gateway: string;
  notifyUrl: string;
  returnUrl: string;
}

export type EpayPayType = 'alipay' | 'wxpay' | 'qqpay' | 'bank' | 'usdt';

const PAY_TYPE_MAP: Record<string, string> = {
  alipay: 'alipay',
  wechat: 'wxpay',
  weixin: 'wxpay',
  wx: 'wxpay',
  wxpay: 'wxpay',
  qq: 'qqpay',
  qqpay: 'qqpay',
  bank: 'bank',
  usdt: 'usdt',
};

export function mapPayType(method: string): string {
  return PAY_TYPE_MAP[method.toLowerCase()] || method || 'alipay';
}

export function buildEpaySign(params: Record<string, any>, key: string): string {
  const filtered = Object.entries(params)
    .filter(([k, v]) => k !== 'sign' && k !== 'sign_type' && v !== '' && v !== null && v !== undefined)
    .sort(([a], [b]) => a.localeCompare(b));

  const signStr = filtered.map(([k, v]) => `${k}=${v}`).join('&') + key;
  return crypto.createHash('md5').update(signStr).digest('hex');
}

export function verifyEpaySign(params: Record<string, any>, key: string): boolean {
  const { sign, ...rest } = params;
  if (!sign) return false;
  const expected = buildEpaySign(rest, key);
  try {
    return crypto.timingSafeEqual(Buffer.from(String(sign)), Buffer.from(expected));
  } catch {
    return false;
  }
}

export function buildGatewayUrl(cfg: EpayConfig, opts: {
  tradeNo: string;
  amount: string;
  name: string;
  payType: string;
  clientIp: string;
}): string {
  const params: Record<string, any> = {
    pid: String(cfg.pid),
    type: mapPayType(opts.payType),
    out_trade_no: opts.tradeNo,
    notify_url: cfg.notifyUrl,
    return_url: cfg.returnUrl,
    name: opts.name,
    money: opts.amount,
    clientip: opts.clientIp || '',
    device: 'pc',
  };

  params.sign = buildEpaySign(params, cfg.key);
  params.sign_type = 'MD5';

  const qs = Object.entries(params)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');

  const gateway = cfg.gateway.replace(/\/+$/, '');
  return `${gateway}/submit.php?${qs}`;
}
