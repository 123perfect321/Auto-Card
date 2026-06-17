import { Request, Response, NextFunction } from 'express';
import * as productService from '../services/product.service';
import { success } from '../utils/response';

export async function getProductList(req: Request, res: Response, next: NextFunction) {
  try {
    const { category_id, keyword, page, page_size, sort } = req.query;
    const result = await productService.getProductList({
      categoryId: category_id ? Number(category_id) : undefined,
      keyword: keyword as string,
      page: page ? Number(page) : 1,
      pageSize: page_size ? Number(page_size) : 20,
      sort: sort as string,
    });
    res.json(success(result));
  } catch (err) {
    next(err);
  }
}

export async function getProductDetail(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    const result = await productService.getProductDetail(id);
    res.json(success(result));
  } catch (err) {
    next(err);
  }
}

export async function getAdminProductList(req: Request, res: Response, next: NextFunction) {
  try {
    const { category_id, keyword, status, page, page_size, sort_by, sort_order } = req.query;
    const result = await productService.getAdminProductList({
      categoryId: category_id ? Number(category_id) : undefined,
      keyword: keyword as string,
      status: status !== undefined ? Number(status) : undefined,
      page: page ? Number(page) : 1,
      pageSize: page_size ? Number(page_size) : 20,
    });
    res.json(success(result));
  } catch (err) {
    next(err);
  }
}

export async function createProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await productService.createProduct(req.body);
    res.json(success(result, '商品创建成功'));
  } catch (err) {
    next(err);
  }
}

export async function updateProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    const result = await productService.updateProduct(id, req.body);
    res.json(success(result, '商品更新成功'));
  } catch (err) {
    next(err);
  }
}

export async function deleteProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    await productService.deleteProduct(id);
    res.json(success(null, '商品删除成功'));
  } catch (err) {
    next(err);
  }
}

export async function toggleProductStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    const result = await productService.toggleProductStatus(id);
    res.json(success(result));
  } catch (err) {
    next(err);
  }
}
