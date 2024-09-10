/** @author Maytheu<maytheu98@gmail.com>
 * @description Server entry file for user service
 */
import express from 'express';
import * as path from 'path';
import { userValidate } from './user.validate';
import { MongoConnect } from '@app/core';
import { seedAdmin } from './user.seed';

const app = express();

app.use('/assets', express.static(path.join(__dirname, 'assets')));

app.get('/api/user', (req, res) => {
  res.send({ message: 'Welcome to user!' });
});

const port = userValidate.PORT;

const startServer = async () => {
  await MongoConnect.connectMongo(userValidate.MONGO_URL);
  await seedAdmin();
  app.listen(port, () => console.log(`Server started on port ${port}`));
};

startServer();
