import { AppError, HttpStatus, notFoundError } from '@app/core';
import { isValidObjectId } from 'mongoose';
import Order from './order.model';
import {
  PAYMENT,
  PRODUCT,
  PRODUCTS,
  RmqConnection,
  UPDATE_PRODUCT,
} from '@app/event';
import { IPlaceOrder, IUpdateOrder } from './order.types';
import { it } from 'node:test';

class OrderService {
  addToCart = async (data: IPlaceOrder) => {
    try {
      await RmqConnection.sendToQueue('PRODUCT', {
        productId: data.productId,
        action: PRODUCT,
      });

      const result = new Promise((resolve, reject) => {
        const consumerTag = `consumer_${data.userId}_${Date.now()}`;

        RmqConnection.consume('CART', async (product) => {
          try {
            const parsedData = JSON.parse(product);
            if (parsedData?.statusCode) {
              RmqConnection.channel.cancel(consumerTag);
              return reject(parsedData);
            }

            const price = parsedData.price * data.quantity;
            if (parsedData.quantity >= data.quantity) {
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

              resolve(order);
            }
            reject(
              new AppError(
                "Product can't be purchased at th moment",
                HttpStatus.HTTP_UNPROCESSABLE_ENTITY
              )
            );
            RmqConnection.channel.cancel(consumerTag);
          } catch (error) {
            RmqConnection.channel.cancel(consumerTag);
            reject(error);
          }
        });
      });
      return await result;
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

      const result = new Promise((resolve, reject) => {
        const consumerTag = `consumer_${userId}_${Date.now()}`;
        RmqConnection.consume('VIEW_CART', (product) => {
          try {
            const products = JSON.parse(product);
            if (products?.statusCode) {
              RmqConnection.channel.cancel(consumerTag);
              return reject(products);
            }

            const allCarts = orders.map((item) => {
              const productItem = products.find(
                (product) => product.id === item.productId
              );

              return {
                price: item.price,
                quantity: item.quantity,
                image: productItem.image,
                product: productItem.name,
                description: productItem.description,
                productInStock: productItem.quantity,
              };
            });

            resolve(allCarts);
            RmqConnection.channel.cancel(consumerTag);
          } catch (error) {
            RmqConnection.channel.cancel(consumerTag);
            return error;
          }
        });
      });
      return await result;
    } catch (error) {
      return error;
    }
  };

  viewCart = async (cartId: string, userId: string) => {
    try {
      if (!isValidObjectId) return notFoundError('Order');
      const order = await Order.findOne({ _id: cartId, userId }, '-userId');

      await RmqConnection.sendToQueue('PRODUCT', {
        productId: order.productId,
        action: PRODUCT,
      });

      const result = new Promise((resolve, reject) => {
        const consumerTag = `consumer_${cartId}_${Date.now()}`;
        RmqConnection.consume('CART', (product) => {
          try {
            const productData = JSON.parse(product);
            if (productData?.statusCode) {
              RmqConnection.channel.cancel(consumerTag);
              return reject(productData);
            }

            const cart = {
              product: productData.name,
              image: productData.image,
              description: productData.description,
              quantity: order.quantity,
              price: order.price,
              productInStock: productData.quantity,
            };

            resolve(cart);
            RmqConnection.channel.cancel(consumerTag);
          } catch (error) {
            RmqConnection.channel.cancel(consumerTag);
            return error;
          }
        });
      });
      return await result;
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

      const result = new Promise((resolve, reject) => {
        const consumerTag = `consumer_${order.userId}_${Date.now()}`;

        RmqConnection.consume('CART', async (product) => {
          try {
            const parsedData = JSON.parse(product);
            if (parsedData?.statusCode) {
              RmqConnection.channel.cancel(consumerTag);
              return reject(parsedData);
            }

            // Handle http request
            if (data.quantity) {
              if (parsedData.quantity >= data.quantity) {
                const updatedCart = await Order.findByIdAndUpdate(
                  cartId,
                  { ...data, price: data.quantity * parsedData.product },
                  { new: true }
                );
                return resolve(updatedCart);
              } else
                reject(
                  new AppError(
                    "Product can't be purchased at th moment",
                    HttpStatus.HTTP_UNPROCESSABLE_ENTITY
                  )
                );
            } else {
              // handle payment service update
              if (data.paymentInitialized)
                await Order.findByIdAndUpdate(cartId, { data });
            }
            RmqConnection.channel.cancel(consumerTag);
          } catch (error) {
            RmqConnection.channel.cancel(consumerTag);
            reject(error);
          }
        });
      });
      return await result;
    } catch (error) {
      return error;
    }
  };

  payCart = async (cartIds: string[], userId: string) => {
    try {
      const carts = await Order.find({
        _id: { $in: cartIds },
        userId,
        isPaid: false,
      });

      carts.forEach(async (cart) => {
        await RmqConnection.sendToQueue('PRODUCT', {
          productId: cart.productId,
          action: PRODUCT,
        });

        return await new Promise((resolve, reject) => {
          const consumerTag = `consumer_${userId}_${Date.now()}`;

          RmqConnection.consume('CART', async (product) => {
            try {
              const parsedData = JSON.parse(product);
              if (parsedData?.statusCode) {
                RmqConnection.channel.cancel(consumerTag);
                return reject(parsedData);
              }

              if (cart.productId === parsedData.id) {
                if (parsedData.quantity >= cart.quantity) {
                  await RmqConnection.sendToQueue('PAYMENT', {
                    price: cart.quantity,
                    action: PAYMENT,
                  });
                }
              }
              RmqConnection.channel.cancel(consumerTag);
            } catch (error) {
              RmqConnection.channel.cancel(consumerTag);
              reject(error);
            }
          });
        });
      });

      // i++;
    } catch (error) {}
  };

  deleteCart = async (cartId: string) => {
    try {
      const order = await Order.findOne({ _id: cartId });
      await RmqConnection.sendToQueue('PRODUCT', {
        productId: order.productId,
        action: PRODUCT,
      });

      const result = new Promise((resolve, reject) => {
        const consumerTag = `consumer_${order.userId}_${Date.now()}`;

        RmqConnection.consume('CART', async (product) => {
          try {
            const parsedData = JSON.parse(product);
            if (parsedData?.statusCode) {
              RmqConnection.channel.cancel(consumerTag);
              return reject(parsedData);
            }

            RmqConnection.sendToQueue('PRODUCT', {
              quantity: order.quantity + parsedData.quantity,
              productId: order.productId,
              action: UPDATE_PRODUCT,
            });

            await Order.findByIdAndDelete(cartId);

            RmqConnection.channel.cancel(consumerTag);
          } catch (error) {
            RmqConnection.channel.cancel(consumerTag);
            reject(error);
          }
        });
      });
      return await result;
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
}

export default new OrderService();
