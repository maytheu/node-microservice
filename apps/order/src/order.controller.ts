import { AppError, Controller } from '@app/core';
import { RequestHandler } from 'express';
import { OrderCartDTO, UpdateOrderDTO } from './order.types';
import orderService from './order.service';

class OrderController extends Controller {
  addToCart: RequestHandler = async (req, res, next) => {
    try {
      const { productId } = req.params;
      const { id } = res.locals;

      await OrderCartDTO.parse(req.body);

      const data = await orderService.addToCart({
        productId,
        userId: id,
        quantity: +req.body.quantity,
      });
      if (data instanceof AppError || data instanceof Error || data?.statusCode)
        return next(data);

      return this.sendResp(res, '', data);
    } catch (error) {
      next(error);
    }
  };

  viewAllCart: RequestHandler = async (req, res, next) => {
    try {
      const { id } = res.locals;

      const data = await orderService.viewAllCart(id);
      if (data instanceof AppError || data instanceof Error || data?.statusCode)
        return next(data);

      return this.sendResp(res, '', data);
    } catch (error) {
      next(error);
    }
  };

  viewCart: RequestHandler = async (req, res, next) => {
    try {
      const { orderId } = req.params;
      const { id } = res.locals;

      const data = await orderService.viewCart(orderId, id);
      if (data instanceof AppError || data instanceof Error || data?.statusCode)
        return next(data);

      return this.sendResp(res, '', data);
    } catch (error) {
      next(error);
    }
  };

  updateCart: RequestHandler = async (req, res, next) => {
    try {
      const { orderId } = req.params;
      const { id } = res.locals;

      await UpdateOrderDTO.parse(req.body);

      const data = await orderService.updateCart(orderId, id, req.body);
      if (data instanceof AppError || data instanceof Error || data?.statusCode)
        return next(data);

      return this.sendResp(res, '', data);
    } catch (error) {
      next(error);
    }
  };

  deleteCart: RequestHandler = async (req, res, next) => {
    try {
      const { orderId } = req.params;
      const { id } = res.locals;

      const data = await orderService.updateCart(orderId, id, req.body);
      if (data instanceof AppError || data instanceof Error || data?.statusCode)
        return next(data);

      return this.sendResp(res, '', data);
    } catch (error) {
      next(error);
    }
  };
}

export default new OrderController();
