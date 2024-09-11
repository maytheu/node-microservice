import { isAuthenticated, isAuthorized } from '@app/core';
import { Router } from 'express';
import productController from './product.controller';

const productRouter = Router();

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
