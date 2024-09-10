/**
 * @author Maytheu<maytheu98@gmail.com>
 * @description - generic error methods
 */
// import { HttpStatus } from '@app/core';
import { AppError } from '@app/error';

export const notFoundError = (error: string) => {
  return new AppError(`${error} not found`, 404, {
    message: `The selected ${error} cannot be found`,
  });
};

export const wrongCredentials = () => {
  return new AppError(
    'Login credentials do not match',
    401
  );
};
