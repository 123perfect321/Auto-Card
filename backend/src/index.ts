import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { config } from './config';
import routes from './routes';
import uploadRoutes from './routes/upload.routes';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler';
import { closeExpiredOrders } from './services/order.service';
import { logger } from './utils/logger';

const app = express();

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: config.cors.origin, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

app.use('/api', routes);
app.use('/api/upload', uploadRoutes);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.use(notFoundHandler);
app.use(errorHandler);

const PORT = config.port;

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

setInterval(async () => {
  try {
    const closed = await closeExpiredOrders();
    if (closed > 0) {
      logger.info(`Closed ${closed} expired orders`);
    }
  } catch (err: any) {
    logger.error('Failed to close expired orders', { error: err.message });
  }
}, 60 * 1000);

export default app;
