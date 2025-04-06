import { WebSocket, WebSocketServer } from 'ws';
import jwt, { JwtPayload } from "jsonwebtoken";
import { prismaClient } from "@repo/db/prismaClient";
import dotenv from 'dotenv';
dotenv.config();

const wss = new WebSocketServer({ port: 8080 });
// function to check whether the token sent is correct or not
function checkUser(token: string): string | null {
    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET!)as JwtPayload;
    
        if(decoded){
            return decoded.userId;
        }
        return null;  
    } catch(e) {
        return null;
    }
}

interface User {
    userId: string;
    ws: WebSocket;
    rooms: string[];
}
const users: User[] = []

wss.on('connection', function connection(ws, request) {
    const url =  request.url;       // ws://localhost:8080?token=123123
    if(!url) {
        ws.close();
        return;
    }

    const queryParams = new URLSearchParams(url.split('?')[1]);
    const token = queryParams.get('token');
    if(!token) {
        ws.close();
        return;
    }

    const userId = checkUser(token);
    if(!userId) {
        ws.close();
        return;
    }
    // pushing the user to the global users array
    users.push({
        userId,
        ws,
        rooms: []
    })

    ws.on('message', async function message(data) {
        // 'data' will be of type string, so we want to parse it to json first
        const parsedData = JSON.parse(data as unknown as string);                 //{type: "join_room", roomId: 1}

        if(parsedData.type === "join_room") {
            // check whether the user exist in users global array
            const user = users.find(x => x.ws === ws);
            if(!user) {
                ws.close();
                return;
            }
            // if user exist push the roomId
            user.rooms.push(parsedData.roomId);
        }

        if(parsedData.type === "leave_room") {
            const user = users.find(x => x.ws === ws);
            if(!user) {
                ws.close();
                return;
            }
            user.rooms = user?.rooms.filter(x => x === parsedData.room);
        }

        if(parsedData.type === "chat") {                    // {type: "chat", message: "hi", roomId: 1}
            const roomId = parsedData.roomId;
            const message = parsedData.message;

            // pushing to db(dumb way)                      // better way is to use message queus
            await prismaClient.chat.create({
                data: {
                    roomId,
                    message,
                    userId
                }
            });

            users.forEach(user => {
                if(user.rooms.includes(roomId)) {
                    user.ws.send(JSON.stringify({
                        type: "chat",
                        message,
                        roomId
                    }));
                }
            });
        }
    });
});