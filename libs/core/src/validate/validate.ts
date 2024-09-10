/**
 * @author Maytheu <maytheu98@gmail.com>
 * Ensure root environment varaibles are available in the env file
 * This should be applied to all services when microservice is fully implemented
 */

import { cleanEnv,  str } from 'envalid';

export const validate = cleanEnv(process.env, {
  MQ_SERVER: str({ default: 'amqp://localhost:5672' }),
  SECRET_KEY: str(),
});
