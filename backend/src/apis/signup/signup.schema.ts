import {z} from 'zod/v4'
import {PrivateUserSchema} from '../user/user.model.ts'

export const SignUpUserSchema =
PrivateUserSchema
  .omit({hash: true, activationToken: true,})
  .extend({
    passwordConfirm: z
      .string('Password confirmation is required.')
      .min(8, 'Password cannot be less than 8 characters long.')
      .max(32, 'Password cannot be over than 32 characters long.'),
    password: z
      .string('password confirmation is required')
      .min(8, 'profile password cannot be less than 8 characters long')
      .max(32, 'profile password cannot be over than 32 characters long')
})
  .refine(data => data.password === data.passwordConfirm, {
    message: 'passwords do not match'
})