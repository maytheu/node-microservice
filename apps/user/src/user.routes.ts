/**
 * @description handle user routes
 */

import { Request, Response, Router } from 'express';
import userController from './user.controller';
import { isAuthenticated } from '@app/core';

const userRouter = Router();

// userRouter.get('/docs', (req: Request, res: Response) => {
//   return res.redirect(
//     'https://documenter.getpostman.com/view/8279131/2sAXqp7htd'
//   );
// });
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
