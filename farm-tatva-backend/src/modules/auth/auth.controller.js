import { registerUser, loginUser } from "./auth.service.js";
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
  res.json(req.user);
};
