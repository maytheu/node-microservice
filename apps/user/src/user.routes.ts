/**
 * @description handle user routes
 */

import { Router } from 'express';
import userController from './user.controller';
import { isAuthenticated } from '@app/core';

const userRouter = Router();

userRouter
  .route('/')
  .get(isAuthenticated, userController.profile)
  .put(isAuthenticated, userController.updateProfile);
userRouter.post('/login', userController.login);
userRouter.post('/register', userController.register);
userRouter.put(
  '/update-password',
  isAuthenticated,
  userController.updatePassword
);

export default userRouter;
