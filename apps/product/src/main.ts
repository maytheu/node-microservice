/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import 'dotenv/config';
import * as path from 'path';
import { productValidate } from './product.validate';
import { MongoConnect } from '@app/core';
import App from './product.app';
import { RmqConnection } from '@app/event';
import { handleIncomingProductQueue } from './product.event';

const app = App.app;

const port = productValidate.PORT;

const startServer = async () => {
  await MongoConnect.connectMongo(productValidate.MONGO_URL);
  await RmqConnection.connect();
  await RmqConnection.consume('PRODUCT', handleIncomingProductQueue);
  app.listen(port, () =>
    console.log(`Product service started on port ${port}`)
  );
};

startServer();
