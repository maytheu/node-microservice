import User from './user.model';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { userValidate } from './user.validate';
// import { AppError, wrongCredentials } from '@app/error';
import { ILogin, IUpdatePassword, IUser } from './user.types';
import { AppError, HttpStatus, wrongCredentials } from '@app/core';

interface Payload {
  email: string;
  name: string;
  isAdmin: boolean;
  id: string;
}

class UserService {
  login = async (data: ILogin) => {
    try {
      const user = await this.checkUser(data.email);
      if (!user) return wrongCredentials();

      const verifyPassword = await this.comparePassword(
        data.password,
        user.password
      );
      if (!verifyPassword) return wrongCredentials();

      const payload = {
        id: user.id,
        email: user.email,
        name: user.name,
        isAdmin: user.isAdmin,
      };
      const token = await this.genToken(payload);
      return token;
    } catch (error) {
      return error;
    }
  };

  register = async (user: IUser, isAdmin = false) => {
    const existingUSer = await this.checkUser(user.email);
    if (existingUSer)
      return new AppError('Account exist', HttpStatus.HTTP_CONFLICT);

    const hash = await this.encryptPassword(user.password);

    const newUser = new User({ ...user, password: hash, isAdmin });
    const payload = {
      id: newUser.id,
      email: user.email,
      name: user.name,
      isAdmin,
    };

    const data = await Promise.all([newUser.save(), this.genToken(payload)]);
    return {
      user: { name: newUser.name, email: newUser.email },
      token: data[1],
    };
  };

  profile = async (email: string) => {
    const user = await this.checkUser(email);
    delete user.password;
    return user;
  };

  updateUser = async (name: string, id: string) => {
    return await User.findByIdAndUpdate(id, { name });
  };

  updatePassword = async (data: IUpdatePassword) => {
    const user = await this.checkUser(data.email);
    const verifyOldPassword = await this.comparePassword(
      data.oldPassword,
      user.password
    );
    if (!verifyOldPassword) return wrongCredentials();

    const hash = await this.encryptPassword(data.newPassword);
    return await User.findByIdAndUpdate(user.id, { password: hash });
  };

  /**
   * check if user exist
   * @param email - user emaol
   * @returns - user id
   */
  private readonly checkUser = async (email: string) => {
    return await User.findOne({ email });
  };

  /**
   * hash password
   * @param password - generated password hash with bcrypt
   * @returns hashed password
   */
  private readonly encryptPassword = async (password: string) => {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    return hash;
  };

  /**
   * generate jwt token
   * @param payload
   * @param time
   * @returns
   */
  private readonly genToken = async (
    payload: Payload,
    time: string = '10d'
  ) => {
    return await jwt.sign(payload, userValidate.SECRET_KEY, {
      expiresIn: time,
    });
  };

  /**
   * Compare user password
   * @param password user input password
   * @param hash hash db password
   * @returns boolean
   */
  private readonly comparePassword = async (password: string, hash: string) => {
    return await bcrypt.compare(password, hash);
  };
}

export default new UserService();
