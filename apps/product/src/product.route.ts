import { isAuthenticated, isAuthorized } from '@app/core';
import { Request, Response, Router } from 'express';
import productController from './product.controller';

const productRouter = Router();

productRouter.get('/docs', (req: Request, res: Response) => {
  return res.redirect(
    'https://documenter.getpostman.com/view/8279131/2sAXqp7htd'
  );
});
productRouter
  .route('/')
  .post(isAuthenticated, isAuthorized, productController.newProduct)
  .get(productController.allProduct);
productRouter
  .route('/:id')
  .delete(isAuthenticated, isAuthorized, productController.deleteProduct)
  .get(productController.product)
  .put(isAuthenticated, isAuthorized, productController.updateProduct);

export default productRouter;
