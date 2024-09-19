import { isAuthenticated } from '@app/core';
import { Request, Response, Router } from 'express';
import orderController from './order.controller';

const orderRouter = Router();

// orderRouter.get('/docs', (req: Request, res: Response) => {
//     return res.redirect(
//       'https://documenter.getpostman.com/view/8279131/2sAXqp7htd'
//     );
//   });
  
orderRouter.post('/:productId', isAuthenticated, orderController.addToCart);
orderRouter.get('/single/:orderId', isAuthenticated, orderController.viewCart);
orderRouter.put('/update/:orderId', isAuthenticated, orderController.updateCart);
orderRouter.get('/', isAuthenticated, orderController.viewAllCart);

export default orderRouter;
