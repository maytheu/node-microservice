import { PAYMENT, RmqConnection, UPDATE_CART } from '@app/event';
import { paymentValidate } from './payment.validation';
import axios from 'axios';
import Payment from './payment.model';

interface PaymentInitialize {
  cartIds: string;
  userId: string;
  email: string;
}

class PaymentService {
  summary = async (cartIds: string, userId: string) => {
    try {
      const carts = cartIds.split(',').map((id) => id.trim());

      await RmqConnection.sendToQueue('ORDER', {
        carts,
        userId,
        action: PAYMENT,
      });
      const result = await this.handleConsumer(userId);

      return { totalAmount: result };
    } catch (error) {
      return error;
    }
  };

  paymentInitialize = async (data: PaymentInitialize) => {
    try {
      const carts = data.cartIds.split(',').map((id) => id.trim());

      await RmqConnection.sendToQueue('ORDER', {
        carts,
        userId: data.userId,
        action: PAYMENT,
      });

      const result = await this.handleConsumer(data.userId);
      

      const paystackUrl = 'https://api.paystack.co/transaction/initialize';
      const response = await axios.post(
        paystackUrl,
        { email: data.email, amount: result * 100 },
        {
          headers: {
            Authorization: `Bearer ${paymentValidate.PAYSTACK}`,
            'Content-Type': 'application/json',
          },
        }
      );

      await Payment.create({
        reference: response.data.data.reference,
        carts: data.cartIds,
        userId: data.userId,
      });
      await RmqConnection.sendToQueue('ORDER', {
        action: UPDATE_CART,
        carts: data.cartIds,
        userId: data.userId,
        data: { paymentInitialized: true },
      });
      return { url: response.data.data.authorization_url };
    } catch (error) {
      return error;
    }
  };

  webhook = async (event: { evt: string; ref: string }) => {
    try {
      if (event.evt === 'charge.success') {
        const payment = await Payment.findOneAndUpdate(
          { reference: event.ref },
          { status: true },
          { new: true }
        );

        await RmqConnection.sendToQueue('ORDER', {
          action: UPDATE_CART,
          carts: payment.carts,
          userId: payment.userId,
          data: { isPaid: true },
        });
      }
      return;
    } catch (error) {
      return error;
    }
  };

  private readonly handleConsumer = async (tag): Promise<any> => {
    return new Promise((resolve, reject) => {
      const consumerTag = `consumer_${tag}_${Date.now()}`;

      RmqConnection.consume(
        'PAYMENT_PRICE',
        async (cartInfo) => {
          try {
            const cart = JSON.parse(cartInfo);
            if (cart?.statusCode) {
              RmqConnection.channel.cancel(consumerTag);
              return reject(cart);
            }
            if (cart.verifyCart.length === 1) resolve(cart.verifyCart[0].price);            
            else
              resolve(cart.verifyCart.reduce((acc, pro) => acc + pro.price, 0));
            resolve(cart);
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

export default new PaymentService();
