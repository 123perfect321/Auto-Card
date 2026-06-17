import { Request, Response, NextFunction } from 'express';
import * as cardService from '../services/card.service';
import { success } from '../utils/response';

export async function importCards(req: Request, res: Response, next: NextFunction) {
  try {
    const { product_id, spec_id, cards } = req.body;
    const result = await cardService.importCards(product_id, spec_id, cards);
    res.json(success(result, `成功导入 ${result.imported} 张卡密`));
  } catch (err) {
    next(err);
  }
}

export async function getCardList(req: Request, res: Response, next: NextFunction) {
  try {
    const { product_id, spec_id, status, page, page_size } = req.query;
    const result = await cardService.getCardList(
      product_id ? Number(product_id) : undefined,
      spec_id ? Number(spec_id) : undefined,
      status ? Number(status) : undefined,
      page ? Number(page) : 1,
      page_size ? Number(page_size) : 20,
    );
    res.json(success(result));
  } catch (err) {
    next(err);
  }
}

export async function invalidateCard(req: Request, res: Response, next: NextFunction) {
  try {
    const cardId = Number(req.params.id);
    await cardService.invalidateCard(cardId);
    res.json(success(null, '卡密已作废'));
  } catch (err) {
    next(err);
  }
}

export async function getCardStats(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await cardService.getCardStats();
    res.json(success(result));
  } catch (err) {
    next(err);
  }
}

export async function clearSpecCards(req: Request, res: Response, next: NextFunction) {
  try {
    const specId = Number(req.params.specId);
    const result = await cardService.clearSpecCards(specId);
    res.json(success(result, `已清空 ${result.cleared} 张卡密`));
  } catch (err) {
    next(err);
  }
}

export async function clearProductCards(req: Request, res: Response, next: NextFunction) {
  try {
    const productId = Number(req.params.productId);
    const result = await cardService.clearProductCards(productId);
    res.json(success(result, `已清空 ${result.cleared} 张卡密`));
  } catch (err) {
    next(err);
  }
}
