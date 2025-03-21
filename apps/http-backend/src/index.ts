import { signInSchema, signUpSchema } from "@repo/common/zod";
import express from "express";
import bcrypt from "bcrypt";
import { prismaClient } from "@repo/db/prismaClient";
import jwt from "jsonwebtoken";
import "dotenv/config"

const app = express();

app.post("/signup", async (req, res) => {
    const parsedData = signUpSchema.safeParse(req.body);

    if(!parsedData.success) {
        res.status(411).json({
            message: "Incorrect format."
        });
        return;
    }

    try{
        const hashedPassword = await bcrypt.hash(parsedData.data.password, 5);

        const user = await prismaClient.user.create({
            data: {
                email: parsedData.data.email,
                password: hashedPassword,
                userName: parsedData.data.userName
            }
        });

        // generate JWT
        const token = jwt.sign({
            userId: user.id
        }, process.env.JWT_SECRET!);

        res.status(200).json({
            message: "Signup succussful",
            token: token
        });
    } catch{
        res.status(409).json({
            message: "Email already exsit."
        });
    }
});

app.listen(3001);