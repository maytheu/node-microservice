import { AppError, HttpStatus, notFoundError } from '@app/core';
import { isValidObjectId } from 'mongoose';
import Order from './order.model';
import {
  PAYMENT,
  PRODUCT,
  PRODUCTS,
  Queue,
  RmqConnection,
  UPDATE_PRODUCT,
  UPDATE_PRODUCT_PAYMENT,
} from '@app/event';
import { IPlaceOrder, IUpdateOrder } from './order.types';
import { date } from 'zod';
import { error } from 'console';

class OrderService {
  addToCart = async (data: IPlaceOrder) => {
    try {
      await RmqConnection.sendToQueue('PRODUCT', {
        productId: data.productId,
        action: PRODUCT,
      });

      const product = await this.handleConsumer('CART', data.userId);
      if (product?.statusCode) throw product;

      const price = product.price * data.quantity;
      if (product.quantity >= data.quantity) {
        let order;
        const orderExist = await Order.findOne({
          productId: data.productId,
          userId: data.userId,
        });
        if (orderExist) {
          order = await Order.findByIdAndUpdate(
            orderExist.id,
            { $inc: { price, quantity: data.quantity } },
            { new: true }
          );
        } else
          order = await Order.create({
            userId: data.userId,
            price,
            productId: data.productId,
            quantity: data.quantity,
          });
        return order;
      } else
        return new AppError(
          "Product can't be purchased at th moment",
          HttpStatus.HTTP_UNPROCESSABLE_ENTITY
        );
    } catch (error) {
      return error;
    }
  };

  viewAllCart = async (userId: string) => {
    try {
      const orders = await Order.find({ userId, isPaid: false }, '-userId');
      const productIds = orders.map((product) => product.productId);
      if (!productIds.length) return [];

      await RmqConnection.sendToQueue('PRODUCT', {
        productIds,
        action: PRODUCTS,
      });

      const products = await this.handleConsumer('VIEW_CART', userId);
      if (products?.statusCode) throw products;

      const allCarts = orders.map((item) => {
        const productItem = products.find(
          (product) => product.id === item.productId
        );

        return {
          price: item.price,
          cartId: item.id,
          quantity: item.quantity,
          image: productItem.image,
          product: productItem.name,
          description: productItem.description,
          productInStock: productItem.quantity,
        };
      });
      return allCarts;
    } catch (error) {
      return error;
    }
  };

  viewCart = async (cartId: string, userId: string) => {
    try {
      if (!isValidObjectId(cartId)) return notFoundError('Order');
      const order = await Order.findOne({ _id: cartId, userId }, '-userId');

      await RmqConnection.sendToQueue('PRODUCT', {
        productId: order.productId,
        action: PRODUCT,
      });

      const productData = await this.handleConsumer('CART', userId);
      if (productData?.statusCode) {
        throw productData;
      }
      const cart = {
        product: productData.name,
        image: productData.image,
        description: productData.description,
        quantity: order.quantity,
        price: order.price,
        cartId: order.id,
        productInStock: productData.quantity,
      };

      return cart;
    } catch (error) {
      return error;
    }
  };

  updateCart = async (cartId: string, userId: string, data: IUpdateOrder) => {
    try {
      const order = await Order.findOne({ _id: cartId });
      if (order.userId !== userId)
        return new AppError(
          'Action cannot be performed',
          HttpStatus.HTTP_FORBIDDEN
        );

      await RmqConnection.sendToQueue('PRODUCT', {
        productId: order.productId,
        action: PRODUCT,
      });

      const product = await this.handleConsumer('CART', order.userId);
      if (product?.statusCode) throw error;

      // Handle http request
      if (data.quantity) {
        if (product.quantity >= data.quantity) {
          const updatedCart = await Order.findByIdAndUpdate(
            cartId,
            { ...data, price: data.quantity * product.price },
            { new: true }
          );
          return updatedCart;
        } else
          return new AppError(
            "Product can't be purchased at th moment",
            HttpStatus.HTTP_UNPROCESSABLE_ENTITY
          );
      }
    } catch (error) {
      return error;
    }
  };

  updateCartPayment = async (
    cartIds: string[],
    userId: string,
    data: IUpdateOrder
  ) => {
    try {
      const orders = await Order.find({ _id: { $in: cartIds } });
      const orderEl = orders.map((order) => {
        return {
          quantity: 0 - order.quantity,
          productId: order.productId,
        };
      });

      if (!orderEl.length) return;
      await RmqConnection.sendToQueue('PRODUCT', {
        data: orderEl,
        action: UPDATE_PRODUCT_PAYMENT,
      });

      await Order.updateMany({ _id: { $in: cartIds } }, { $set: data });
    } catch (error) {
      throw error;
    }
  };

  payCart = async (cartIds: string[], userId: string) => {
    try {
      cartIds.forEach(async (cart) => {
        if (!isValidObjectId(cart)) {
          return await RmqConnection.sendToQueue('PAYMENT_PRICE', {
            price: 0,
            action: PAYMENT,
          });
        }
      });
      const carts = await Order.find({
        _id: { $in: cartIds },
        userId,
        isPaid: false,
      });

      if (!carts.length)
        return await RmqConnection.sendToQueue('PAYMENT_PRICE', {
          price: 0,
          action: PAYMENT,
        });
      const productIds = carts.map((el) => el.productId);
      await RmqConnection.sendToQueue('PRODUCT', {
        action: PRODUCTS,
        productIds,
      });

      const products = await this.handleConsumer('VIEW_CART', userId);
      if (products?.statusCode) throw products;

      if (carts.length === products.length) {
        const verifyCart = carts.map((el, i) => {
          if (el.productId === products[i].id)
            if (products[i].quantity >= el.quantity)
              return { cart: el.id, product: el.productId, price: el.price };
        });
        await RmqConnection.sendToQueue('PAYMENT_PRICE', {
          verifyCart,
        });
      }
    } catch (error) {}
  };

  deleteCart = async (cartId: string) => {
    try {
      const order = await Order.findOne({ _id: cartId });
      await RmqConnection.sendToQueue('PRODUCT', {
        productId: order.productId,
        action: PRODUCT,
      });

      const product = await this.handleConsumer('CART', order.userId);
      if (product?.statusCode) throw product;

      if (order.paymentInitialized) {
        await RmqConnection.sendToQueue('PRODUCT', {
          quantity: order.quantity + product.quantity,
          productId: order.productId,
          action: UPDATE_PRODUCT,
        });
      }

      await Order.findByIdAndDelete(cartId);

      return;
    } catch (error) {
      return error;
    }
  };

  cronCart = async () => {
    try {
      const orders = await Order.find({
        paymentInitialized: true,
        isPaid: false,
      });

      if (!orders.length) return;

      const orderEl = orders.map((order) => ({
        quantity:  order.quantity,
        productId: order.productId,
      }));
      await RmqConnection.sendToQueue('PRODUCT', {
        action: UPDATE_PRODUCT_PAYMENT,
        data: orderEl,
      });

      orders.forEach(async (order) => {
        await RmqConnection.sendToQueue('PRODUCT', {
          productId: order.productId,
          action: PRODUCT,
        });

        return await new Promise((resolve, reject) => {
          const consumerTag = `consumer_${order.userId}_${Date.now()}`;

          RmqConnection.consume('CART', async (product) => {
            try {
              const parsedData = JSON.parse(product);
              if (parsedData?.statusCode) {
                RmqConnection.channel.cancel(consumerTag);
                return reject(parsedData);
              }

              await Order.findByIdAndUpdate(order.id, {
                paymentInitialized: false,
              });
              RmqConnection.sendToQueue('PRODUCT', {
                quantity: order.quantity + parsedData.quantity,
                productId: order.productId,
                action: UPDATE_PRODUCT,
              });
            } catch (error) {
              RmqConnection.channel.cancel(consumerTag);
              reject(error);
            }
          });
        });
      });
    } catch (error) {
      return error;
    }
  };

  private readonly handleConsumer = async (
    queue: Queue,
    tag: string
  ): Promise<any> => {
    return await new Promise((resolve, reject) => {
      const consumerTag = `consumer_${tag}_${Date.now()}`;

      RmqConnection.consume(
        queue,
        async (data) => {
          try {
            const parsedData = JSON.parse(data);
            if (parsedData?.statusCode) {
              RmqConnection.channel.cancel(consumerTag);
              return reject(parsedData);
            }
            resolve(parsedData);
            RmqConnection.channel.cancel(consumerTag);
          } catch (error) {
            RmqConnection.channel.cancel(consumerTag);
            reject(error);
          }
        },
        consumerTag
      );
    });
  };
}

export default new OrderService();
