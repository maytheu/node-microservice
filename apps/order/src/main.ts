/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import 'dotenv/config';
import * as path from 'path';
import App from './order.app';
import { MongoConnect } from '@app/core';
import { orderValidate } from './order.validate';
import { RmqConnection } from '@app/event';
import { handleIncomingOrderQueue } from './order.consume';

const app = App.app;

const port = orderValidate.PORT;

const startServer = async () => {
  await MongoConnect.connectMongo(orderValidate.MONGO_URL);
  await RmqConnection.connect()
  await RmqConnection.consume('ORDER', handleIncomingOrderQueue)
  app.listen(port, () => console.log(`User Service started on port ${port}`));
};

startServer();
