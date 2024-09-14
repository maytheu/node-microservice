import { AppError, Controller } from '@app/core';
import { RequestHandler } from 'express';
import { SummaryDTO } from './payment.types';
import paymentService from './payment.service';

class PaymentController extends Controller {
  summary: RequestHandler = async (req, res, next) => {
    try {
      const { id } = res.locals;

      await SummaryDTO.parse(req.body);

      const data = await paymentService.summary(req.body.cart, id);
      if (data instanceof AppError || data instanceof Error) return next(data);

      this.sendResp(res, '', data);
    } catch (error) {
      next(error);
    }
  };

  paymentInitialize: RequestHandler = async (req, res, next) => {
    try {
      const { id, email } = res.locals;

      await SummaryDTO.parse(req.body);

      const data = await paymentService.paymentInitialize({
        cartIds: req.body.cart,
        userId: id,
        email,
      });
      if (data instanceof AppError || data instanceof Error) return next(data);

      this.sendResp(res, '', data);
    } catch (error) {
      next(error);
    }
  };
  webhook: RequestHandler = async (req, res, next) => {
    try {
      const data = req.body;

      const res = await paymentService.webhook({
        evt: data.event,
        ref: data.data.reference,
      });
      if (res instanceof AppError || res instanceof Error) return next(res);

      this.sendResp(res, '', data);
    } catch (error) {
      next(error);
    }
  };
}

export default new PaymentController();
