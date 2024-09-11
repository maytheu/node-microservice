/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import express from 'express';
import * as path from 'path';
import { productValidate } from './product.validate';
import { MongoConnect } from '@app/core';
import App from './product.app';

const app = App.app

const port = productValidate.PORT;

const startServer = async () => {
  await MongoConnect.connectMongo(productValidate.MONGO_URL);
  app.listen(port, () => console.log(`Server started on port ${port}`));
};

startServer();
