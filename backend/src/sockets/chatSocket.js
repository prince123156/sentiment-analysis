import Message from "../models/Message.js";
import Room from "../models/Room.js";
import User from "../models/User.js";
import { cleanText } from "../utils/sanitize.js";
import { analyzeSentiment } from "../utils/sentimentClient.js";

const roomNegativeCounts = new Map();

function roomUsers(io, roomId) {
  const adapterRoom = io.sockets.adapter.rooms.get(roomId);
  return adapterRoom ? adapterRoom.size : 0;
}

export function registerChatSocket(io) {
  io.on("connection", async (socket) => {
    await User.findByIdAndUpdate(socket.user._id, {
      isOnline: true,
      lastSeen: new Date()
    });

    io.emit("user:status", {
      userId: socket.user._id,
      isOnline: true
    });

    socket.on("room:join", async ({ roomId }) => {
      const room = await Room.findByIdAndUpdate(
        roomId,
        { $addToSet: { members: socket.user._id } },
        { new: true }
      );

      if (!room) return socket.emit("error:message", "Room not found");

      socket.join(roomId);
      io.to(roomId).emit("room:presence", {
        roomId,
        activeUsers: roomUsers(io, roomId)
      });
    });

    socket.on("room:leave", ({ roomId }) => {
      socket.leave(roomId);
      io.to(roomId).emit("room:presence", {
        roomId,
        activeUsers: roomUsers(io, roomId)
      });
    });

    socket.on("typing:start", ({ roomId }) => {
      socket.to(roomId).emit("typing:start", {
        roomId,
        userId: socket.user._id,
        name: socket.user.name
      });
    });

    socket.on("typing:stop", ({ roomId }) => {
      socket.to(roomId).emit("typing:stop", {
        roomId,
        userId: socket.user._id
      });
    });

    socket.on("message:send", async ({ roomId, text }) => {
      const clean = cleanText(text);
      if (!clean) return socket.emit("error:message", "Message cannot be empty");

      const room = await Room.findById(roomId);
      if (!room) return socket.emit("error:message", "Room not found");

      const sentiment = await analyzeSentiment(clean);
      const message = await Message.create({
        room: roomId,
        sender: socket.user._id,
        text: clean,
        sentiment,
        readBy: [socket.user._id]
      });

      await Room.findByIdAndUpdate(roomId, { updatedAt: new Date() });

      const populated = await message.populate("sender", "name email");
      io.to(roomId).emit("message:new", populated);

      if (sentiment.label === "negative") {
        const current = (roomNegativeCounts.get(roomId) || 0) + 1;
        roomNegativeCounts.set(roomId, current);

        const threshold = Number(process.env.NEGATIVE_ALERT_THRESHOLD || 3);
        if (current >= threshold) {
          io.to(roomId).emit("sentiment:alert", {
            roomId,
            message: "This conversation is becoming highly negative."
          });
          roomNegativeCounts.set(roomId, 0);
        }
      } else if (sentiment.label === "positive") {
        roomNegativeCounts.set(roomId, 0);
      }
    });

    socket.on("disconnect", async () => {
      await User.findByIdAndUpdate(socket.user._id, {
        isOnline: false,
        lastSeen: new Date()
      });

      io.emit("user:status", {
        userId: socket.user._id,
        isOnline: false
      });
    });
  });
}
