import { cleanEnv, num, str } from 'envalid';

export const paymentValidate = cleanEnv(process.env, {
  PORT: num({ default: 3000 }),
  MONGO_URL: str(),
  PAYSTACK: str(),
});
