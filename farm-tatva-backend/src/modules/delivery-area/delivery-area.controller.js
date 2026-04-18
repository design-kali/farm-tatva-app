import { getDeliveryAreas } from "./delivery-area.service.js";

export const listDeliveryAreas = async (_req, res) => {
  const deliveryAreas = await getDeliveryAreas();
  res.json(deliveryAreas);
};

