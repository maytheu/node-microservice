import { isAuthenticated } from '@app/core';
import { Request, Response, Router } from 'express';
import paymentController from './payment.controller';
import { paystackIpWhiteList } from './payment.middleware';

const paymentRouter = Router();
paymentRouter.get('/docs', (req: Request, res: Response) => {
    return res.redirect(
      'https://documenter.getpostman.com/view/8279131/2sAXqp7htd'
    );
  });
  
paymentRouter.post('/verify', isAuthenticated, paymentController.summary);
paymentRouter.post('/', isAuthenticated, paymentController.paymentInitialize);
paymentRouter.post('/webhook', paystackIpWhiteList, paymentController.webhook);

export default paymentRouter;
