import {
  PRODUCT,
  PRODUCTS,
  UPDATE_PRODUCT,
  UPDATE_PRODUCT_PAYMENT,
} from '@app/event';
import productService from './product.service';

export const handleIncomingProductQueue = async (data: string) => {
  try {
    const parsedData = JSON.parse(data);
    console.log(`Received Notification`, parsedData);
    if (parsedData.action === PRODUCT) {
      await productService.product(parsedData.productId);
    }
    if (parsedData.action === PRODUCTS) {
      await productService.productIds(parsedData.productIds);
    }
    if (parsedData.action === UPDATE_PRODUCT) {
      await productService.updateProduct(
        { quantity: parsedData.quantity },
        parsedData.productId
      );
    }
    if (parsedData.action === UPDATE_PRODUCT_PAYMENT) {
      await productService.updateProductPayment(parsedData.data);
    }
  } catch (error) {
    console.error(`Error While Parsing the message`);
  }
};
