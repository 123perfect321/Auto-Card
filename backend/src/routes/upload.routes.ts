import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import { authMiddleware } from '../middlewares/auth.middleware';
import { success } from '../utils/response';

const router = Router();

const storage = multer.diskStorage({
  destination: path.join(__dirname, '../../public/uploads'),
  filename: (_req: Request, file: Express.Multer.File, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req: Request, file: Express.Multer.File, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp|svg/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype.replace('image/', ''));
    if (ext && mime) {
      cb(null, true);
    } else {
      cb(new Error('仅支持图片文件 (jpg/png/gif/webp/svg)'));
    }
  },
});

router.post('/', authMiddleware, upload.single('file'), (req: Request, res: Response) => {
  if (!req.file) {
    res.status(400).json({ code: 400, msg: '请选择图片文件', data: null });
    return;
  }
  const url = `/uploads/${req.file.filename}`;
  res.json(success({ url, filename: req.file.filename }, '上传成功'));
});

export default router;
