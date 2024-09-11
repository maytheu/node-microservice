/**
 * @author Maytheu<maytheu98@gmail.com>
 * @description - generic error methods
 */
import { AppError, HttpStatus } from '@app/core';

export const notFoundError = (error: string) => {
  return new AppError(`${error} not found`, HttpStatus.HTTP_NOT_FOUND, {
    message: `The selected ${error} cannot be found`,
  });
};

export const wrongCredentials = () => {
  return new AppError(
    'Login credentials do not match',
    HttpStatus.HTTP_UNAUTHORIZED
  );
};
