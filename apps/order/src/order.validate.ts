import { cleanEnv, num, str } from 'envalid';

export const orderValidate = cleanEnv(process.env, {
  PORT: num({ default: 3001 }),
  MONGO_URL: str(),
});
