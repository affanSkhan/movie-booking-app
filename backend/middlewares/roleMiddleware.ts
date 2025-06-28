import { type Request, type Response, type NextFunction } from 'express';
import { createError } from '../utils/handleErrors';

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== 'admin') {
    return next(createError('Admin access required', 403));
  }
  next();
};

export const requireUser = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(createError('User access required', 401));
  }
  next();
}; 