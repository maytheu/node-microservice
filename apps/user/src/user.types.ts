import { string, z } from 'zod';

const LoginDTO = z
  .object({
    email: z.string().email(),
    password: z.string().min(6),
  })
  .strict();

const User = z.object({
  name: z.string(),
});

const UpdatePasswordDTO = z
  .object({
    oldPassword: z.string().min(6),
    newPassword: z.string().min(6),
  })
  .strict();

const UpdateProfileDTO = z
  .object({
    name: z.string(),
  })
  .strict();

const RegisterDTO = LoginDTO.merge(User);
const IUpdatePassword = UpdatePasswordDTO.merge(
  z.object({ email: z.string() })
);

type ILogin = z.infer<typeof LoginDTO>;
type IUser = z.infer<typeof RegisterDTO>;
type IUpdatePassword = z.infer<typeof IUpdatePassword>;

export {
  LoginDTO,
  ILogin,
  IUser,
  RegisterDTO,
  IUpdatePassword,
  UpdatePasswordDTO,
  UpdateProfileDTO,
};
