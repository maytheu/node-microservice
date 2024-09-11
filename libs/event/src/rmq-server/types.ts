export const PRODUCT = 'PRODUCT';
export const UPDATE_PRODUCT = 'UPDATE_PRODUCT';
export const PRODUCTS = 'PRODUCTS';
export const CART = 'CART';
export const VIEW_CART = 'VIEW_CART';
export const ORDER = 'ORDER';
export const PAYMENT = 'PAYMENT';

export type Queue =
  | 'PRODUCT'
  | 'PRODUCTS'
  | 'CART'
  | 'ORDER'
  | 'VIEW_CART'
  | 'UPDATE_PRODUCT'
  | 'PAYMENT';
