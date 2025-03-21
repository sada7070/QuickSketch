import { z } from "zod";

export const signUpSchema = z.object({
    email: z.string().email(),
    password: z.string().min(4).max(20),
    userName: z.string().max(25)
})

export const signInSchema = z.object({
    email: z.string().email(),
    password: z.string().min(4).max(20)
})

export const createRoomSchema = z.object({
    roomName: z.string().max(30)
})