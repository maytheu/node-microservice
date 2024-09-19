/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import 'dotenv/config';
import * as path from 'path';
import App from './order.app';
import { MongoConnect, PageRefresh } from '@app/core';
import { orderValidate } from './order.validate';
import { RmqConnection } from '@app/event';
import { handleIncomingOrderQueue } from './order.event';
import orderJob from './order.job';

const app = App.app;

const port = orderValidate.PORT;

const startServer = async () => {
  await MongoConnect.connectMongo(orderValidate.MONGO_URL);
  await RmqConnection.connect();
  // new PageRefresh('').performJob;
  await orderJob.performJob.start();
  await RmqConnection.consume('ORDER', handleIncomingOrderQueue);
  app.listen(port, () => console.log(`Order Service started on port ${port}`));
};

startServer();
