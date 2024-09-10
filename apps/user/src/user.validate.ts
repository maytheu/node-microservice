import { cleanEnv, num, str } from 'envalid';

export const userValidate = cleanEnv(process.env, {
  PORT: num({ default: 3003 }),
  MONGO_URL: str(),
  SECRET_KEY:str()
});
