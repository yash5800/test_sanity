import {z} from 'zod'

export const formSchema = z.object({
  key:z.string().min(4)
})