import { PAYMENT, UPDATE_CART } from '@app/event';
import orderService from './order.service';

export const handleIncomingOrderQueue = async (data: string) => {
  try {
    const parsedData = JSON.parse(data);
    if (parsedData.action === PAYMENT) {
      await orderService.payCart(parsedData.carts, parsedData.userId);
    }
    if (parsedData.action === UPDATE_CART) {
      await orderService.updateCartPayment(
        parsedData.carts,
        parsedData.userId,
        parsedData.data
      );
    }
    console.log(`Received Notification`, parsedData);
  } catch (error) {
    console.error(`Error While Parsing the message`);
  }
};
