import { isAuthenticated } from '@app/core';
import { Router } from 'express';
import paymentController from './payment.controller';
import { paystackIpWhiteList } from './payment.middleware';

const paymentRouter = Router();

paymentRouter.post('/verify', isAuthenticated, paymentController.summary);
paymentRouter.post('/', isAuthenticated, paymentController.paymentInitialize);
paymentRouter.post('/webhook', paystackIpWhiteList, paymentController.webhook);

export default paymentRouter;
