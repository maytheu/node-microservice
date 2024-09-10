import { RequestHandler } from 'express';
import { AppError } from '@app/error';
import jwt from 'jsonwebtoken';
import { env, HttpStatus } from '@app/core';

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader)
      return next(new AppError('Please login to access this resource', 401));

    const token = authHeader.split(' ')[1];
    if (!token)
      return next(new AppError('Please login to access this resource', 401));

    const verify = jwt.verify(token, env.SECRET_KEY);
    res.locals = verify;
    next();
  } catch (error) {
    next(error);
  }
};

export const isAuthorized: RequestHandler = async (req, res, next) => {
  const { isAdmin } = res.locals;
  if (!isAdmin)
    return next(
      new AppError("You're not allowed here", HttpStatus.HTTP_FORBIDDEN)
    );
  next();
};
