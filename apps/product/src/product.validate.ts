import { cleanEnv, num, str } from 'envalid';

export const productValidate = cleanEnv(process.env, {
  PORT: num({ default: 3002 }),
  MONGO_URL: str(),
  CLOUDINARY_CLOUD: str(),
  CLOUDINARY_KEY: str(),
  CLOUDINARY_SECRET: str(),
});
