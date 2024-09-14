import { model, Schema } from 'mongoose';

const paymentSchema = new Schema({
  reference: { type: String, required: true },
  carts: { type: [String] },
  userId: { type: String, required: true },
  status: { type: Boolean, default: false },
});

const Payment = model('payment', paymentSchema);

export default Payment;
