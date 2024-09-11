/** @author Maytheu<maytheu98@gmail.com>
 * @description Server entry file for user service
 */
import 'dotenv/config';
import * as path from 'path';
import { userValidate } from './user.validate';
import { MongoConnect } from '@app/core';
import { seedAdmin } from './user.seed';
import App from './user.app';

const app = App.app;

const port = userValidate.PORT;

const startServer = async () => {
  await MongoConnect.connectMongo(userValidate.MONGO_URL);
  await seedAdmin();
  app.listen(port, () => console.log(`User Service started on port ${port}`));
};

startServer();
