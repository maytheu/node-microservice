import { RequestHandler } from 'express';
import { AppError } from '@app/core';

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader)
      return next(new AppError('Please login to access this resource', 401));
  } catch (error) {
    next(error);
  }
};
