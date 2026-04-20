import {
  getDeliveryAreas,
  createDeliveryArea,
  updateDeliveryArea,
  deleteDeliveryArea,
} from "./delivery-area.service.js";

export const listDeliveryAreas = async (_req, res) => {
  const deliveryAreas = await getDeliveryAreas();
  res.json(deliveryAreas);
};

export const addDeliveryArea = async (req, res) => {
  try {
    const deliveryArea = await createDeliveryArea(req.body);
    res.json(deliveryArea);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const editDeliveryArea = async (req, res) => {
  try {
    const deliveryArea = await updateDeliveryArea(req.params.id, req.body);
    res.json(deliveryArea);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const removeDeliveryArea = async (req, res) => {
  try {
    await deleteDeliveryArea(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

