/**
 * Accept request only from paystack
 */
import { AppError, HttpStatus } from '@app/core';

export const paystackIpWhiteList = async (req, res, next) => {
  const paystackIps = ['52.31.139.75', '52.49.173.169', '52.214.14.220'];
  const ip = req.ip;
  for (let paystackIp of paystackIps) {
    if (paystackIp === ip) return next();
  }
  return next(new AppError("You're lost", HttpStatus.HTTP_FORBIDDEN));
};

