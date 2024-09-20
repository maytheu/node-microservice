/**
 * @author Maytheu <maytheu98@gmail.com>
 * @description Handle product service REST API
 */
import { AppError, Controller, HttpStatus } from '@app/core';
import { RequestHandler } from 'express';
import { IProduct, NewProductDTO } from './product.types';
import productService from './product.service';
import formidable, { Files, Part } from 'formidable';

class ProductController extends Controller {
  private readonly formidableOptions = {
    multiples: false,
    maxFileSize: 16 * 1024 * 1024,
    filter: (mimetype: Part) =>
      !!(mimetype.mimetype && mimetype.mimetype.includes('image')),
  };

  newProduct: RequestHandler = async (req, res, next) => {
    const form = formidable(this.formidableOptions);
    form.parse(req, async (err, fields, files) => {
      try {
        if (err) return next(err);

        await NewProductDTO.parse(fields);

        //check for valid image
        if (Object.keys(files).length === 0 || !('image' in files))
          return next(
            new AppError(
              'Upload an Image',
              HttpStatus.HTTP_UNPROCESSABLE_ENTITY,
              { message: 'Image not found' }
            )
          );

        const newProduct = <IProduct>{};
        newProduct.name = fields.name[0];
        newProduct.description = fields.description[0];
        newProduct.price = +fields.price[0];
        newProduct.quantity = +fields.quantity[0];
        newProduct.image = this.formidableFileImages(files)[0].filepath;

        const data = await productService.newProduct(newProduct);
        if (data instanceof AppError || data instanceof Error)
          return next(data);

        return this.sendCreatedResp(res, 'Product created successfully', data);
      } catch (error) {
        next(error);
      }
    });
  };

  product: RequestHandler = async (req, res, next) => {
    try {
      const { id } = req.params;
      const data = await productService.product(id);
      if (data instanceof AppError || data instanceof Error) return next(data);

      return this.sendResp(res, '', data);
    } catch (error) {
      next(error);
    }
  };

  deleteProduct: RequestHandler = async (req, res, next) => {
    try {
      const { id } = req.params;
      const data = await productService.deleteProduct(id);
      if (data instanceof AppError || data instanceof Error) return next(data);

      return this.sendDelResp(res, '');
    } catch (error) {
      next(error);
    }
  };

  allProduct: RequestHandler = async (req, res, next) => {
    try {
      const { name,  filter, limit, page } = req.query;

      const productLimit = +limit || 10;
      const productPage = +page || 1;
      const query = {
        name: name && `${name}`,
      };
      const price_quantity = `${filter}`;

      const data = await productService.allProduct(
        query,
        price_quantity,
        productLimit,
        productPage
      );
      if (data instanceof AppError || data instanceof Error) return next(data);

      return this.sendResp(res, '', data);
    } catch (error) {
      next(error);
    }
  };

  updateProduct: RequestHandler = async (req, res, next) => {
    const form = formidable(this.formidableOptions);
    const { id } = req.params;

    form.parse(req, async (err, fields, files) => {
      try {
        if (err) return next(err);

        await NewProductDTO.parse(fields);

        const product = {} as IProduct;
        if (fields.name.length) product.name = fields.name[0];
        if (fields.description.length)
          product.description = fields.description[0];
        if (fields.quantity.length) product.quantity = +fields.quantity[0];
        if (fields.price.length) product.price = +fields.price[0];

        //check for valid image
        if (Object.keys(files).length > 0 || 'image' in files)
          product.image = this.formidableFileImages(files)[0].filepath;

        const data = await productService.updateProduct(product, id);
        if (data instanceof AppError || data instanceof Error)
          return next(data);

        return this.sendCreatedResp(res, 'Product updated successfully', data);
      } catch (error) {
        next(error);
      }
    });
  };

  private readonly formidableFileImages = (files: Files) => {
    if (files.image instanceof Array) {
      return files.image;
    } else return [files.image];
  };

  private isIProduct(key: string): key is keyof IProduct {
    return ['name', 'description', 'image', 'quantity', 'price'].includes(key);
  }
}

export default new ProductController();
