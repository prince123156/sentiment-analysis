import User from "../models/User.js";
import { verifyToken } from "../utils/token.js";

export async function socketAuth(socket, next) {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Authentication required"));

    const payload = verifyToken(token);
    const user = await User.findById(payload.id);
    if (!user) return next(new Error("User not found"));

    socket.user = user;
    next();
  } catch (error) {
    next(new Error("Invalid token"));
  }
}
