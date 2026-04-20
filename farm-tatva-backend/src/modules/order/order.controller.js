import {
  placeOrder,
  getOrders,
  updateOrderStatus,
} from "./order.service.js";

export const createOrderOld = async (req, res) => {
  try {
    const order = await placeOrder(req.user.id);
    res.json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const createOrder = async (req, res) => {
  try {
    const { addressId } = req.body;
    const order = await placeOrder(req.user.id, addressId);
    res.json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const listOrders = async (req, res) => {
  const orders = await getOrders(req.user.id, req.user.role === "ADMIN");
  res.json(orders);
};

export const changeOrderStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;

    const order = await updateOrderStatus(orderId, status);

    res.json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
