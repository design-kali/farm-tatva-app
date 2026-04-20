import { getUsers, updateUser, deleteUser } from "./user.service.js";

export const listUsers = async (_req, res) => {
  const users = await getUsers();
  res.json(users);
};

export const editUser = async (req, res) => {
  try {
    const user = await updateUser(req.params.id, req.body);
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const removeUser = async (req, res) => {
  try {
    await deleteUser(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
