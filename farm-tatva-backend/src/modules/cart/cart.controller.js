import {
  addToCart,
  getCart,
  updateCartItem,
  removeFromCart,
} from "./cart.service.js";

export const addItem = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    await addToCart(req.user.id, productId, quantity);
    const cart = await getCart(req.user.id);

    res.json(cart);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getUserCart = async (req, res) => {
  const cart = await getCart(req.user.id);
  res.json(cart);
};

export const updateItem = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    await updateCartItem(req.user.id, productId, quantity);
    const cart = await getCart(req.user.id);

    res.json(cart);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const removeItem = async (req, res) => {
  try {
    const { productId } = req.params;
    await removeFromCart(req.user.id, productId);
    const cart = await getCart(req.user.id);

    res.json(cart);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
