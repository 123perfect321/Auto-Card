import nodemailer from 'nodemailer';
import { config } from '../config';
import { logger } from '../utils/logger';

const transporter = nodemailer.createTransport({
  host: config.smtp.host,
  port: config.smtp.port,
  secure: config.smtp.port === 465,
  auth: {
    user: config.smtp.user,
    pass: config.smtp.pass,
  },
});

export async function sendCardEmail(email: string, orderNo: string, cards: string[]) {
  if (!config.smtp.host) {
    logger.warn('SMTP not configured, skipping email send');
    return;
  }

  const cardList = cards.map(c => `<li style="margin-bottom:8px;font-family:monospace;">${c}</li>`).join('');

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
      <h2 style="color:#6B72E1;">您的卡密已到达</h2>
      <p>订单号：<strong>${orderNo}</strong></p>
      <p>以下是您的卡密信息，请妥善保管：</p>
      <ul style="background:#f5f5f5;padding:20px;border-radius:8px;">${cardList}</ul>
      <p style="color:#666;font-size:14px;">如有疑问，请联系客服。</p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: config.smtp.from,
      to: email,
      subject: `【星云发卡】订单 ${orderNo} 卡密信息`,
      html,
    });
    logger.info(`Email sent to ${email} for order ${orderNo}`);
  } catch (err: any) {
    logger.error(`Failed to send email to ${email}`, { error: err.message });
  }
}

export async function sendTestEmail(to: string) {
  if (!config.smtp.host) throw new Error('SMTP 未配置');

  await transporter.sendMail({
    from: config.smtp.from,
    to,
    subject: '【星云发卡】测试邮件',
    html: '<p>这是一封测试邮件，如果您收到此邮件，说明邮件配置正确。</p>',
  });
}
