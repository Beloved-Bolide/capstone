import {z} from "zod";


export const UserSchema = z.object({
  id: z.uuidv7('Please provide a valid uuid for id'),
  email: z.email('Please provide a valid email')
  .max(128, 'please provide a valid email (max 128 characters)'),
  notifications: z.boolean('please provide a valid notifications (true or false)'),
  name: z.string('Please provide a valid name')
  .trim()
  .min(1, 'please provide a valid name(min 1 characters)')
  .max(32, 'please provide a valid name(max 32 characters)'),
})

export type User =  z.infer<typeof UserSchema>

export const SignUpSchema = UserSchema.omit({id:true, notifications: true, name: true})
.extend({
  passwordConfirm:z.string('password confirmation is required')
  .min(8,'password confirm cannot be less than 8 characters')
  .max(32,'profile password'),
  password: z.string('password is required')
  .min(8, 'profile password cannot be less than 8 characters')
  .max(32,'profile password cannot be over 32 characters')
})
.refine(data => data.password === data.passwordConfirm, {
  message: 'passwords do not match'
})

export type SignUp = z.infer<typeof SignUpSchema>
