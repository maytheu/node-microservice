import { isAuthenticated } from '@app/core';
import { Router } from 'express';
import orderController from './order.controller';

const orderRouter = Router();

orderRouter.post('/:productId', isAuthenticated, orderController.addToCart);
orderRouter.get('/', isAuthenticated, orderController.viewAllCart);

export default orderRouter;
