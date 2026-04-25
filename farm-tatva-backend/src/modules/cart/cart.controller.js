import {
  addToCart,
  getCart,
  updateCartItem,
  removeFromCart,
} from "./cart.service.js";

export const addItem = async (req, res) => {
  try {
    const { pricingOptionId, quantity } = req.body;
    const cart = await addToCart(req.user.id, pricingOptionId, quantity);

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
    const { cartItemId, quantity } = req.body;
    const cart = await updateCartItem(req.user.id, cartItemId, quantity);

    res.json(cart);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const removeItem = async (req, res) => {
  try {
    const { cartItemId } = req.params;
    const cart = await removeFromCart(req.user.id, cartItemId);

    res.json(cart);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
