import { model, Schema } from 'mongoose';

const orderSchema = new Schema(
  {
    userId: { type: String, required: true },
    productId: { type: String, required: true },
    quantity: { type: Number, default: 1 },
    price: { type: Number },
    isPaid: { type: Boolean, default: false },
    paymentInitialized: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const Order = model('order', orderSchema);

export default Order;
