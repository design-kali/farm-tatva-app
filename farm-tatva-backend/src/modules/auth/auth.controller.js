import {
  registerUser,
  loginUser,
  getUserProfileById,
} from "./auth.service.js";
import { generateToken } from "../../utils/jwt.js";

export const register = async (req, res) => {
  try {
    const user = await registerUser(req.body);
    const token = generateToken(user);

    res.json({ user, token });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const user = await loginUser(req.body.email, req.body.password);
    const token = generateToken(user);

    res.json({ user, token });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getProfile = async (req, res) => {
  const user = await getUserProfileById(req.user.id);

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  res.json(user);
};
