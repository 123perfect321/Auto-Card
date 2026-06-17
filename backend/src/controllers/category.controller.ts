import { Request, Response, NextFunction } from 'express';
import * as categoryService from '../services/category.service';
import { success } from '../utils/response';

export async function getCategories(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await categoryService.getCategories();
    res.json(success(result));
  } catch (err) {
    next(err);
  }
}

export async function getAllCategories(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await categoryService.getAllCategories();
    res.json(success(result));
  } catch (err) {
    next(err);
  }
}

export async function createCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await categoryService.createCategory(req.body);
    res.json(success(result, '分类创建成功'));
  } catch (err) {
    next(err);
  }
}

export async function updateCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    const result = await categoryService.updateCategory(id, req.body);
    res.json(success(result, '分类更新成功'));
  } catch (err) {
    next(err);
  }
}

export async function deleteCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    await categoryService.deleteCategory(id);
    res.json(success(null, '分类删除成功'));
  } catch (err) {
    next(err);
  }
}
