import Room from "../models/Room.js";
import Message from "../models/Message.js";
import { cleanText } from "../utils/sanitize.js";

export async function getRooms(req, res) {
  const rooms = await Room.find()
    .populate("members", "name email isOnline lastSeen")
    .sort({ updatedAt: -1 });

  const roomIds = rooms.map((room) => room._id);
  const unread = await Message.aggregate([
    { $match: { room: { $in: roomIds }, readBy: { $ne: req.user._id } } },
    { $group: { _id: "$room", count: { $sum: 1 } } }
  ]);

  const unreadMap = new Map(unread.map((item) => [String(item._id), item.count]));

  return res.json({
    rooms: rooms.map((room) => ({
      ...room.toObject(),
      unreadCount: unreadMap.get(String(room._id)) || 0
    }))
  });
}

export async function createRoom(req, res) {
  const name = cleanText(req.body.name);
  const description = cleanText(req.body.description);

  if (!name) return res.status(400).json({ message: "Room name is required" });

  const existing = await Room.findOne({ name });
  if (existing) return res.status(409).json({ message: "Room already exists" });

  const room = await Room.create({
    name,
    description,
    members: [req.user._id],
    createdBy: req.user._id
  });

  return res.status(201).json({ room });
}

export async function joinRoom(req, res) {
  const room = await Room.findByIdAndUpdate(
    req.params.roomId,
    { $addToSet: { members: req.user._id } },
    { new: true }
  ).populate("members", "name email isOnline lastSeen");

  if (!room) return res.status(404).json({ message: "Room not found" });
  return res.json({ room });
}

export async function getMessages(req, res) {
  const room = await Room.findById(req.params.roomId);
  if (!room) return res.status(404).json({ message: "Room not found" });

  await Message.updateMany(
    { room: room._id, readBy: { $ne: req.user._id } },
    { $addToSet: { readBy: req.user._id } }
  );

  const messages = await Message.find({ room: room._id })
    .populate("sender", "name email")
    .sort({ createdAt: 1 })
    .limit(200);

  return res.json({ messages });
}
