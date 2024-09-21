/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */
import 'dotenv/config';
import express from 'express';
import * as path from 'path';
import App from './payment.app'
import { paymentValidate } from './payment.validation';
import { MongoConnect, PageRefresh } from '@app/core';
import { RmqConnection } from '@app/event';

const app = App.app;

const port = paymentValidate.PORT;

const startServer = async () => {
  await MongoConnect.connectMongo(paymentValidate.MONGO_URL);
  new PageRefresh('https://payment-service-8scu.onrender.com').performJob;
  await RmqConnection.connect()
  app.listen(port, () => console.log(`Payment Service started on port ${port}`));
};

startServer();
