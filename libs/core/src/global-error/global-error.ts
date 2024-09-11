/**
 * @author Maytheu <maytheu98@gmail.com>
 * @description handles custom error, prod and dev error
 */
import { Request, Response, NextFunction } from 'express';
import { AppError, HttpStatus, validate } from '@app/core';

const handleCastErrorDB = (err: any) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, HttpStatus.HTTP_BAD_REQUEST, {});
};

const handleDuplicateFieldsDB = (err: any) => {
  const value = err.errmsg?.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, HttpStatus.HTTP_BAD_REQUEST, {
    message: value,
  });
};

const handleValidationErrorDB = (err: any) => {
  const errors = Object.values(err.errors).map((el: any) => el.message);

  const message = `Invalid input data. ${errors.join('. ')}`;

  return new AppError(message, HttpStatus.HTTP_BAD_REQUEST, {
    message: errors,
  });
};

/** ======DEVELOPMENT ERROR HANLDER ======= */
/* A function that takes in an error, a request, and a response and formats the error messages. */
const sendErrorDev = (err: AppError, req: Request, res: Response) => {
  return res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const handleZodError = (err: any) => {
  const formmatedMsg = err.issues.map(
    (el: { path: string; message: string }) => `${el.path[0]} - ${el.message}`
  );
  return new AppError(`Validation Error - ${formmatedMsg.join('. ')}`, 422);
};

/** ======PRODUCTION ERROR HANLDER ======= */
const sendErrorProd = async (err: AppError, req: Request, res: Response) => {
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      error: err.error,
    });
  }
  console.error('ERROR 💥', err);

  return res.status(HttpStatus.HTTP_BAD_GATEWAY).json({
    status: 'error',
    message: 'Something went very wrong!',
  });
};

/**==== HANLDER METHOD ===== */
/* server globale middleware function that takes in an error, a request, a response, and a next function and formats the error messages. */
export default function (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  err.statusCode = err.statusCode || HttpStatus.HTTP_INTERNAL_SERVER_ERROR;
  err.status = err.status || 'error';

  if (validate.isDev) {
    return sendErrorDev(err, req, res);
  } else {
    let error: any = { ...err, name: err.name };

    error.message = err.message;

    //send 500 error status to email
    error.stack = err.stack;

    if (error.name === 'ZodError') error = handleZodError(error);
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);

    return sendErrorProd(error, req, res);
  }
}
