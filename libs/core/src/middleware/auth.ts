import { RequestHandler } from 'express';
import * as jwt from 'jsonwebtoken';
import { AppError, validate, HttpStatus } from '@app/core';

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader)
      return next(
        new AppError(
          'Please login to access this resource',
          HttpStatus.HTTP_UNAUTHORIZED
        )
      );

    const token = authHeader.split(' ')[1];
    if (!token)
      return next(
        new AppError(
          'Please login to access this resource',
          HttpStatus.HTTP_UNAUTHORIZED
        )
      );

    const verify = jwt.verify(token, validate.SECRET_KEY);
    res.locals = verify as Record<string, any>;
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
