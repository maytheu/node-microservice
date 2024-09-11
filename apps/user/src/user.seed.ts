import User from './user.model';

const user = {
  name: 'Admin',
  email: 'admin@ecommerce.com',
  isAdmin: true,
  password: '1234567',
};

export const seedAdmin = async () => {
  const admin = await User.findOne({ email: user.email });
  if (admin) return;
  await User.create(user);
};
