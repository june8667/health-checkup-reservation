import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';

export class AppError extends Error {
  statusCode: number;
  code?: string;

  constructor(message: string, statusCode: number = 500, code?: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }
}

export function errorMiddleware(
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error('Error:', err);

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      code: err.code,
    });
    return;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    res.status(400).json({
      success: false,
      message: '입력값이 올바르지 않습니다.',
      error: env.isDev ? err.message : undefined,
    });
    return;
  }

  // Mongoose duplicate key error
  if ((err.name === 'MongoServerError' || err.name === 'MongoError') && (err as any).code === 11000) {
    const keyValue = (err as any).keyValue;
    let message = '이미 존재하는 데이터입니다.';

    if (keyValue?.email) {
      message = '이미 가입된 이메일입니다.';
    } else if (keyValue?.phone) {
      message = '이미 가입된 휴대폰 번호입니다.';
    }

    res.status(409).json({
      success: false,
      message,
    });
    return;
  }

  res.status(500).json({
    success: false,
    message: '서버 오류가 발생했습니다.',
    error: env.isDev ? err.message : undefined,
  });
}

export function notFoundMiddleware(_req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    message: '요청하신 리소스를 찾을 수 없습니다.',
  });
}
