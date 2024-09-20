import { isValidObjectId } from 'mongoose';
import Product from './product.model';
import { IProduct, IProductQuery } from './product.types';
import { AppError, HttpStatus, notFoundError } from '@app/core';
import { productValidate } from './product.validate';
import { v2 as cloudinary } from 'cloudinary';
import { RmqConnection } from '@app/event';

cloudinary.config({
  cloud_name: productValidate.CLOUDINARY_CLOUD,
  api_key: productValidate.CLOUDINARY_KEY,
  api_secret: productValidate.CLOUDINARY_SECRET,
});

class ProductService {
  private readonly regex = /\b(<|>|>=|=|<|>=)\b/g;

  newProduct = async (data: IProduct) => {
    try {
      const img = await this.upload(data.image);
      if (img.name === 'Error' || img.error)
        return new AppError(
          'Error uploading file',
          HttpStatus.HTTP_BAD_REQUEST,
          {
            message: 'Image cannot be uploaded to cloudinary',
          }
        );

      data.image = img.secure_url;
      return await Product.create(data);
    } catch (error) {
      return error;
    }
  };

  allProduct = async (
    query: { name: string; },
    filter: string,
    limit: number,
    page: number
  ) => {
    try {
      const objQuery: any = {};
      objQuery.isDeleted = false;
      if (query.name) objQuery.name = { $regex: query.name, $options: 'i' };
      // if (query.description)
      //   objQuery.description = { $regex: query.description, $options: 'i' };

      if (filter) {
        let filters = filter.replace(
          this.regex,
          (match: string) => `-${this.operationMap[match]}-`
        );

        const options = ['price', 'quantity'];
        // filters =
        filters.split(',').forEach((item) => {
          const [field, operator, value] = item.split('-');
          if (options.includes(field)) {
            objQuery[field] = { [operator]: +value };
          }
        });
      }

      let product = Product.find(objQuery, '-isDeleted');
      //show pages per page
      const skip = (page - 1) * limit;
      product = product.skip(skip).limit(limit);

      const products = await product;

      return products.sort(() => 0.5 - Math.random());
    } catch (error) {
      return error;
    }
  };

  product = async (id: string) => {
    try {
      if (!isValidObjectId(id)) {
        const e = notFoundError('Product');
        RmqConnection.sendToQueue('CART', e);
        return e;
      }
      const product = await Product.findById(id, '-isDeleted');
      RmqConnection.sendToQueue('CART', product);
      return product;
    } catch (error) {
      RmqConnection.sendToQueue('CART', error);
      return error;
    }
  };

  productIds = async (ids: string[]) => {
    try {
      const products = await Product.find({ _id: { $in: ids } }, '-isDeleted');
      return RmqConnection.sendToQueue('VIEW_CART', products);
    } catch (error) {
      RmqConnection.sendToQueue('VIEW_CART', error);
      return error;
    }
  };

  updateProduct = async (data: IProduct, id: string) => {
    try {
      if (!isValidObjectId(id)) return notFoundError('Product');
      if (data.image) {
        const img = await this.upload(data.image);
        if (img.name === 'Error' || img.error)
          return new AppError(
            'Error uploading file',
            HttpStatus.HTTP_BAD_REQUEST,
            {
              message: 'Image cannot be uploaded to cloudinary',
            }
          );
        data.image = img.secure_url;
      }
      return await Product.findByIdAndUpdate(id, { data }, { new: true });
    } catch (error) {
      return error;
    }
  };

  updateProductPayment = async (
    data: { productId: string; quantity: number }[]
  ) => {
    try {
      return data.forEach(async (el) => {
        await Product.findByIdAndUpdate(el.productId, {
          $inc: { quantity: el.quantity },
        });
      });
    } catch (error) { 
      return error;
    }
  };

  deleteProduct = async (id: string) => {
    try {
      if (!isValidObjectId(id)) return notFoundError('Product');
      return await Product.findByIdAndUpdate(id, { isDeleted: true });
    } catch (error) {
      return error;
    }
  };

  private readonly upload = async (image: string) => {
    try {
      return await cloudinary.uploader.upload(image);
    } catch (error) {
      return error;
    }
  };

  private readonly operationMap: any = {
    '>': '$gt',
    '>=': '$gte',
    '<': '$lt',
    '<=': '$lte',
    '=': '$eq',
  };
}

export default new ProductService();
