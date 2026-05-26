import "dotenv/config";
import http from "http";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { Server } from "socket.io";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import roomRoutes from "./routes/roomRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import { socketAuth } from "./middleware/socketAuth.js";
import { registerChatSocket } from "./sockets/chatSocket.js";

const app = express();
const server = http.createServer(app);
const clientURL = process.env.CLIENT_URL || "http://localhost:5173";

app.use(helmet());
app.use(cors({ origin: clientURL, credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 250,
    standardHeaders: true,
    legacyHeaders: false
  })
);

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "backend" });
});

app.use("/api/auth", authRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Something went wrong" });
});

const io = new Server(server, {
  cors: {
    origin: clientURL,
    credentials: true
  }
});

io.use(socketAuth);
registerChatSocket(io);

const port = process.env.PORT || 5000;

connectDB()
  .then(() => {
    server.listen(port, () => console.log(`Backend running on port ${port}`));
  })
  .catch((error) => {
    console.error("Failed to start backend", error);
    process.exit(1);
  });
