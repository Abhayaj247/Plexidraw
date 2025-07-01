import { WebSocket, WebSocketServer } from "ws";
import jwt, { decode } from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";
import { prismaClient } from "@repo/db/client";

const wss = new WebSocketServer({
  port: 8080,
  verifyClient: (info, cb) => {
    // Allow all origins
    cb(true);
  },
});

// Log when server starts
console.log("WebSocket Server is running on port 8080");

interface User {
  ws: WebSocket;
  rooms: string[];
  userId: string;
}

const users: User[] = [];

function checkUser(token: string): string | null {
  // Always allow guests (no token)
  if (!token) {
    return `guest_${Math.random().toString(36).substr(2, 9)}`;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (typeof decoded == "string") {
      return null;
    }
    if (!decoded || !decoded.userId) {
      return null;
    }
    return decoded.userId;
  } catch (error) {
    return null;
  }
}

// Log connection attempts
wss.on("error", (error) => {
  console.error("WebSocket Server Error:", error);
});

wss.on("connection", function connection(ws, request) {
  const url = request.url;
  if (!url) {
    ws.close();
    return;
  }

  const queryParams = new URLSearchParams(url.split("?")[1]);
  const token = queryParams.get("token") || "";
  const userId = checkUser(token);

  if (!userId) {
    ws.close();
    return;
  }

  users.push({
    userId,
    rooms: [],
    ws,
  });

  ws.on("message", async function message(data) {
    let parsedData;
    try {
      if (typeof data !== "string") {
        parsedData = JSON.parse(data.toString());
      } else {
        parsedData = JSON.parse(data);
      }
    } catch (error) {
      console.error("Failed to parse message:", error);
      return;
    }

    if (parsedData.type === "join_room") {
      const user = users.find((x) => x.ws === ws);
      user?.rooms.push(parsedData.roomId);
    }

    if (parsedData.type === "leave_room") {
      const user = users.find((x) => x.ws === ws);
      if (!user) {
        return;
      }
      user.rooms = user.rooms.filter((x) => x === parsedData.room);
    }

    if (parsedData.type === "chat") {
      const roomId = parsedData.roomId;
      const message = parsedData.message;
      const user = users.find((x) => x.ws === ws);

      let username = userId;
      if (user) {
        const dbUser = await prismaClient.user.findUnique({ where: { id: userId } });
        username = dbUser?.username || userId;
        await prismaClient.chat.create({
          data: {
            roomId: Number(roomId),
            message,
            userId,
          },
        });
      }

      // Broadcast to all users in the room
      users.forEach((u) => {
        if (u.rooms.includes(roomId)) {
          u.ws.send(
            JSON.stringify({
              type: "chat",
              message: message,
              userId: username,
              roomId,
            })
          );
        }
      });
    }

    if (parsedData.type === "drawing_create") {
      const { roomId, drawing } = parsedData;
      const user = users.find((x) => x.ws === ws);

      // Only store drawings for authenticated users
      let created = drawing;
      let clientTempId = drawing.clientTempId;
      if (user) {
        // Remove frontend-only fields
        const { id, clientTempId: tempId, isEditing, ...drawingData } = drawing;
        created = await prismaClient.drawing.create({
          data: {
            ...drawingData,
            roomId: Number(roomId),
            userId,
          },
        });
        clientTempId = tempId;
      }

      users.forEach((u) => {
        if (u.rooms.includes(roomId)) {
          u.ws.send(
            JSON.stringify({
              type: "drawing_create",
              drawing: { ...created, clientTempId },
              roomId,
            })
          );
        }
      });
    }

    if (parsedData.type === "drawing_update") {
      const { roomId, drawing } = parsedData;
      const user = users.find((x) => x.ws === ws);

      // Only update drawings for authenticated users
      let updated = drawing;
      if (user) {
        // Remove frontend-only fields
        const { isEditing, clientTempId, ...drawingData } = drawing;
        updated = await prismaClient.drawing.update({
          where: { id: drawing.id },
          data: drawingData,
        });
      }

      users.forEach((u) => {
        if (u.rooms.includes(roomId)) {
          u.ws.send(
            JSON.stringify({
              type: "drawing_update",
              drawing: updated,
              roomId,
            })
          );
        }
      });
    }

    if (parsedData.type === "drawing_delete") {
      const { roomId, drawingId } = parsedData;
      const user = users.find((x) => x.ws === ws);

      // Only delete drawings for authenticated users
        console.log('Attempting to delete drawing:', drawingId, 'by user:', userId);
        try {
          await prismaClient.drawing.delete({
            where: { id: drawingId },
          });
        } catch (e: any) {
          if (e.code !== 'P2025') {
            console.error('Failed to delete drawing:', e);
          }
          // else: ignore not found error
      }

      users.forEach((u) => {
        if (u.rooms.includes(roomId)) {
          u.ws.send(
            JSON.stringify({
              type: "drawing_delete",
              drawingId,
              roomId,
            })
          );
        }
      });
    }
  });

  // Handle disconnection
  ws.on("close", () => {
    const index = users.findIndex((u) => u.ws === ws);
    if (index !== -1) {
      users.splice(index, 1);
    }
  });

  // Handle errors
  ws.on("error", (error) => {
    console.error("WebSocket client error:", error);
  });
});
