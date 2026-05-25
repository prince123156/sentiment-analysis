import User from "../models/User.js";
import { signToken } from "../utils/token.js";
import { cleanText } from "../utils/sanitize.js";

function publicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    isOnline: user.isOnline
  };
}

export async function register(req, res) {
  const name = cleanText(req.body.name);
  const email = cleanText(req.body.email).toLowerCase();
  const password = String(req.body.password || "");

  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({ message: "Enter a valid email address" });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters" });
  }

  const exists = await User.findOne({ email });
  if (exists) return res.status(409).json({ message: "Email already registered" });

  const user = await User.create({ name, email, password });
  return res.status(201).json({ user: publicUser(user), token: signToken(user) });
}

export async function login(req, res) {
  const email = cleanText(req.body.email).toLowerCase();
  const password = String(req.body.password || "");

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  return res.json({ user: publicUser(user), token: signToken(user) });
}

export async function me(req, res) {
  return res.json({ user: publicUser(req.user) });
}
