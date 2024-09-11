import User from './user.model';
import userService from './user.service';

const user = {
  name: 'Admin',
  email: 'admin@ecommerce.com',
  password: '1234567',
};

export const seedAdmin = async () => {
  await userService.register(user, true);
};
