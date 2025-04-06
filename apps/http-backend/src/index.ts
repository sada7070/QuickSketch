import { createRoomSchema, signInSchema, signUpSchema } from "@repo/common/zod";
import express from "express";
import bcrypt from "bcryptjs";
import { prismaClient } from "@repo/db/prismaClient";
import jwt from "jsonwebtoken";
import dotenv from 'dotenv';
dotenv.config();

import AuthenticatedRequest, { userMiddleware } from "./middleware";

const app = express();
app.use(express.json());

// http://localhost:3001/signup
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

app.post("/signin", async(req, res) => {
    const parsedData = signInSchema.safeParse(req.body);

    if(!parsedData.success) {
        res.status(411).json({
            message: "Incorrect format."
        });
        return;
    }

    const userExist = await prismaClient.user.findFirst({
        where: {
            email: parsedData.data.email
        }
    });

    if(!userExist) {
        res.status(401).json({
            message: "Email does not exist."
        });
        return;
    }

    const passwordMatched = await bcrypt.compare(parsedData.data.password, userExist.password);

    if(!passwordMatched) {
        res.status(401).json({
            message: "Incorrect password."
        });
        return;
    }
    
    const token = jwt.sign({
        userId: userExist.id
    }, process.env.JWT_SECRET!);

    res.status(200).json({
        message: "Signin succussful.",
        token: token
    });
});

// to create a room
app.post("/room", userMiddleware, async(req:AuthenticatedRequest, res) => {
    const parsedData = createRoomSchema.safeParse(req.body);

    if(!parsedData.success) {
        res.status(411).json({
            message: "Incorrect format."
        });
        return;
    }

    const userId = req.userId;

    try{
        const room = await prismaClient.room.create({
            data: {
                slug: parsedData.data.roomName,
                adminId: userId!
            }
        });

        res.status(200).json({
            message: "Room created succussfully.",
            roomId: room.id
        });

    } catch {
        res.status(409).json({
            message: "Room name already exist."
        });
    }
});

// to get recent chats(upto 50)
app.get("/chats/:roomId", async (req, res) => {
    const roomId = Number(req.params.roomId);

    const messages = await prismaClient.chat.findMany({
        where: {
            roomId: roomId
        },
        orderBy: {
            id: "desc"
        },
        take: 50
    });

    res.status(200).json({
        messages
    });
});

// given the slug, get the roomId
app.get("/room/:slug", async (req, res) => {
    const slug = req.params.slug;

    const room = await prismaClient.room.findFirst({
        where: {
            slug
        }
    });

    res.status(200).json({
        room
    });
});

app.listen(3001);