import {
  createAddress,
  getUserAddresses,
  deleteAddress,
} from "./address.service.js";

export const addAddress = async (req, res) => {
  try {
    const address = await createAddress(req.user.id, req.body);
    res.json(address);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const listAddresses = async (req, res) => {
  const deliveryAreaId =
    typeof req.query.deliveryAreaId === "string"
      ? req.query.deliveryAreaId
      : undefined;
  const addresses = await getUserAddresses(req.user.id, deliveryAreaId);
  res.json(addresses);
};

export const removeAddress = async (req, res) => {
  try {
    const result = await deleteAddress(req.user.id, req.params.id);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
