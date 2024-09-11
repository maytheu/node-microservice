/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import express from 'express';
import * as path from 'path';
import { productValidate } from './product.validate';
import { MongoConnect } from '@app/core';

const app = express();

app.use('/assets', express.static(path.join(__dirname, 'assets')));

app.get('/api', (req, res) => {
  res.send({ message: 'Welcome to product!' });
});

const port = productValidate.PORT;

const startServer = async () => {
  await MongoConnect.connectMongo(productValidate.MONGO_URL);
  app.listen(port, () => console.log(`Server started on port ${port}`));
};

startServer();
