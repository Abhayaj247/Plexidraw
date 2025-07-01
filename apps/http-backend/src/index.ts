import express from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";
import { authMiddleware } from "./middleware";
import bcrypt from "bcryptjs";
import {
  CreateUserSchema,
  SigninSchema,
  CreateRoomSchema,
} from "@repo/common/types";
import { prismaClient } from "@repo/db/client";
import cors from "cors";

const app = express();
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
}));
app.use(express.json());

app.post("/signup", async (req, res) => {
  const parsedData = CreateUserSchema.safeParse(req.body);
  if (!parsedData.success) {
    res.json({
      message: "Incorrect data",
      errors: parsedData.error.errors,
    });
    return;
  }
  try {
    //check if user already exists
    const existingUser = await prismaClient.user.findFirst({
      where: {
        OR: [
          {
            email: parsedData.data.email,
          },
          {
            username: parsedData.data.username,
          },
        ],
      },
    });
    if (existingUser) {
      const field =
        existingUser.email === parsedData.data.email ? "email" : "username";
      res.status(400).json({
        message: `${field} already exists`,
        field: field,
      });
      return;
    }
    const hashedPassword = await bcrypt.hash(parsedData.data.password, 10);
    const user = await prismaClient.user.create({
      data: {
        username: parsedData.data.username,
        email: parsedData.data.email,
        password: hashedPassword,
        name: parsedData.data.name,
      },
    });
    res.status(200).json({
      userId: user.id,
      message: "User Created Successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong",
    });
  }
});
app.post("/signin", async (req, res) => {
  const parsedData = SigninSchema.safeParse(req.body);
  if (!parsedData.success) {
    res.json({
      message: "Incorrect data",
      errors: parsedData.error.errors,
    });
    return;
  }
  //check if user exists
  const user = await prismaClient.user.findFirst({
    where: {
      username: parsedData.data.Username,
    },
  });
  //check if user exists
  if (!user) {
    res.status(400).json({
      message: "User not found",
    });
    return;
  }
  //check if user has a password
  if (!user.password) {
    res.status(400).json({
      message: "User not found",
    });
    return;
  }
  //check if password is correct
  const isPasswordCorrect = await bcrypt.compare(
    parsedData.data.password,
    user.password
  );
  if (!isPasswordCorrect) {
    res.status(400).json({
      message: "Incorrect password",
    });
    return;
  }

  const token = jwt.sign(
    {
      userId: user.id,
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
  res.status(200).json({
    token: token,
    message: "Signin successful",
  });
});

app.post("/room", authMiddleware, async (req, res) => {
  const parsedData = CreateRoomSchema.safeParse(req.body);
  if (!parsedData.success) {
    res.json({
      message: "Incorrect data",
      errors: parsedData.error.errors,
    });
    return;
  }
  const userId = req.userId;
  if (!userId) {
    res.status(401).json({
      message: "Unauthorized",
    });
    return;
  }
  try {
    const room = await prismaClient.room.create({
      data: {
        slug: parsedData.data.name,
        adminId: userId,
      },
    });
    res.status(200).json({
      roomId: room.id,
    });
  } catch (error) {
    res.status(511).json({
      message: "Room already exists with this name",
    });
  }
});

app.get("/chats/:roomId", async (req, res) => {
  const roomId = Number(req.params.roomId);
  const messages = await prismaClient.chat.findMany({
    where: { roomId: roomId },
    orderBy: { id: "desc" },
    take: 50,
    select: {
      message: true,
      createdAt: true,
      user: { select: { username: true } },
    },
  });
  res.status(200).json({
    messages: messages.map(msg => ({
      message: msg.message,
      username: msg.user ? msg.user.username : 'Guest',
      createdAt: msg.createdAt ? msg.createdAt.toISOString() : new Date().toISOString(),
    })),
  });
});

app.get("/room/:slug", async (req, res) => {
  const slug = req.params.slug;
  const room = await prismaClient.room.findFirst({
    where: {
      slug,
    },
  });
  res.status(200).json({
    room,
  });
});

app.get("/drawings/:roomId", authMiddleware, async (req, res) => {
  const roomId = Number(req.params.roomId);
  const drawings = await prismaClient.drawing.findMany({
    where: { roomId },
    orderBy: { createdAt: "asc" },
  });
  res.status(200).json({ drawings });
});

app.get("/rooms", async (req, res) => {
  const rooms = await prismaClient.room.findMany({
    select: { id: true, slug: true, adminId: true },
    orderBy: { createdAt: "desc" },
  });
  res.status(200).json({ rooms });
});

app.get("/user/:id", authMiddleware, async (req, res) => {
  const userId = req.params.id;
  if (!userId) {
    res.status(400).json({ message: "User ID is required" });
    return;
  }
  try {
    const user = await prismaClient.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, username: true, email: true },
    });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch user info" });
  }
});

app.put("/user/:id", authMiddleware, async (req, res) => {
  const userId = req.params.id;
  if (!userId) {
    res.status(400).json({ message: "User ID is required" });
    return;
  }
  if (req.userId !== userId) {
    res.status(403).json({ message: "You can only update your own profile" });
    return;
  }
  const { name, username, email } = req.body;
  if (!name || !username || !email) {
    res.status(400).json({ message: "Name, username, and email are required" });
    return;
  }
  try {
    const updatedUser = await prismaClient.user.update({
      where: { id: userId },
      data: { name, username, email },
      select: { id: true, name: true, username: true, email: true },
    });
    res.status(200).json({ user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: "Failed to update user info" });
  }
});

app.listen(3001);
