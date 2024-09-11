import { Controller } from '@app/core';
import { RequestHandler } from 'express';
import {
  LoginDTO,
  RegisterDTO,
  UpdatePasswordDTO,
  UpdateProfileDTO,
} from './user.types';
import userService from './user.service';
import { AppError } from '@app/core';

class UserController extends Controller {
  login: RequestHandler = async (req, res, next) => {
    try {
      await LoginDTO.parse(req.body);

      const data = await userService.login(req.body);
      if (data instanceof AppError || data instanceof Error) return next(data);

      this.sendResp(res, '', { token: data });
    } catch (error) {
      next(error);
    }
  };

  register: RequestHandler = async (req, res, next) => {
    try {
      await RegisterDTO.parse(req.body);

      const data = await userService.register(req.body);
      if (data instanceof AppError || data instanceof Error) return next(data);

      this.sendCreatedResp(res, 'Account created successfully', {
        token: data,
      });
    } catch (error) {
      next(error);
    }
  };

  profile: RequestHandler = async (req, res, next) => {
    try {
      const { email } = res.locals;
      const data = await userService.profile(email);
      if (data instanceof AppError || data instanceof Error) return next(data);

      return this.sendResp(res, '', data);
    } catch (error) {
      next(error);
    }
  };

  updateProfile: RequestHandler = async (req, res, next) => {
    try {
      await UpdateProfileDTO.parse(req.body);
      const { id } = res.locals;

      const data = await userService.updateUser(req.body.name, id);
      if (data instanceof AppError || data instanceof Error) return next(data);

      return this.sendResp(res, 'Profile updated', {});
    } catch (error) {
      next(error);
    }
  };

  updatePassword: RequestHandler = async (req, res, next) => {
    try {
      await UpdatePasswordDTO.parse(req.body);
      const { email } = res.locals;

      const data = await userService.updatePassword({ ...req.body, email });
      if (data instanceof AppError || data instanceof Error) return next(data);

      return this.sendResp(res, 'Password updated', {});
    } catch (error) {
      next(error);
    }
  };
}

export default new UserController();
