type LogLevel = 'info' | 'warn' | 'error' | 'debug';

function log(level: LogLevel, message: string, meta?: any) {
  const timestamp = new Date().toISOString();
  const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
  console.log(`[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}`);
}

export const logger = {
  info: (msg: string, meta?: any) => log('info', msg, meta),
  warn: (msg: string, meta?: any) => log('warn', msg, meta),
  error: (msg: string, meta?: any) => log('error', msg, meta),
  debug: (msg: string, meta?: any) => log('debug', msg, meta),
};
