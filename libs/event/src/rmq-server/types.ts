export const PRODUCT = 'PRODUCT';
export const UPDATE_PRODUCT = 'UPDATE_PRODUCT';
export const UPDATE_PRODUCT_PAYMENT = 'UPDATE_PRODUCT_PAYMENT';
export const PRODUCTS = 'PRODUCTS';
export const CART = 'CART';
export const UPDATE_CART = 'UPDATE_CART';
export const VIEW_CART = 'VIEW_CART';
export const ORDER = 'ORDER';
export const PAYMENT = 'PAYMENT';
export const PAYMENT_PRICE = 'PAYMENT_PRICE';

export type Queue =
  | 'PRODUCT'
  | 'PRODUCTS'
  | 'CART'
  | 'ORDER'
  | 'VIEW_CART'
  | 'UPDATE_PRODUCT'
  | 'PAYMENT'
  | 'PAYMENT_PRICE'
  | 'UPDATE_CART';
