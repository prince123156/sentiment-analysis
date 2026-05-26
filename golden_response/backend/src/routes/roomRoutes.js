import express from "express";
import {
  createRoom,
  getMessages,
  getRooms,
  joinRoom
} from "../controllers/roomController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);
router.get("/", getRooms);
router.post("/", createRoom);
router.post("/:roomId/join", joinRoom);
router.get("/:roomId/messages", getMessages);

export default router;
