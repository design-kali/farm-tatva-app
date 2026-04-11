import {
  addToCart,
  getCart,
  updateCartItem,
  removeFromCart,
} from "./cart.service.js";

export const addItem = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const result = await addToCart(req.user.id, productId, quantity);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getUserCart = async (req, res) => {
  const cart = await getCart(req.user.id);
  res.json(cart);
};

export const updateItem = async (req, res) => {
  const { productId, quantity } = req.body;
  const result = await updateCartItem(req.user.id, productId, quantity);
  res.json(result);
};

export const removeItem = async (req, res) => {
  const { productId } = req.params;
  const result = await removeFromCart(req.user.id, productId);
  res.json(result);
};
