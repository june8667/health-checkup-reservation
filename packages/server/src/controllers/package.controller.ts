import { Request, Response, NextFunction } from 'express';
import { PackageService } from '../services/package.service';

const packageService = new PackageService();

export async function getPackages(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { category, targetGender, minPrice, maxPrice, page, limit } = req.query;

    const result = await packageService.findAll({
      category: category as string,
      targetGender: targetGender as string,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
    });

    res.json({
      success: true,
      data: {
        items: result.packages,
        total: result.total,
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 10,
        totalPages: Math.ceil(result.total / (limit ? Number(limit) : 10)),
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getPackageById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const pkg = await packageService.findById(req.params.id);

    res.json({
      success: true,
      data: pkg,
    });
  } catch (error) {
    next(error);
  }
}

export async function getAvailableSlots(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { date } = req.query;
    if (!date) {
      res.status(400).json({
        success: false,
        message: '날짜를 선택해주세요.',
      });
      return;
    }

    const slots = await packageService.getAvailableSlots(
      req.params.id,
      new Date(date as string)
    );

    res.json({
      success: true,
      data: slots,
    });
  } catch (error) {
    next(error);
  }
}

export async function getCategories(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const categories = await packageService.getCategories();

    res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
}
