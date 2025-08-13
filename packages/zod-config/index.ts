import {z} from "zod"

export const signUpSchema = z.object({
	username: z.string(),
	googleId: z.string(),
	email: z.string(),
	image: z.string(),
})

export const signInSchema = z.object({
	googleId: z.string(),
	email: z.string(),
})

