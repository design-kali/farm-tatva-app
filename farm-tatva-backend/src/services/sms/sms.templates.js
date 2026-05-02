export const smsTemplates = {
  otp: (otp) => `code: ${otp}`,

  orderPlaced: (orderId) =>
    `Thank you for your order! Your FarmTatva order #${orderId} has been placed successfully.`,

  orderConfirmed: (orderId) =>
    `Good news! Your FarmTatva order #${orderId} has been confirmed and is being prepared.`,

  orderDispatched: (orderId) =>
    `Your FarmTatva order #${orderId} is out for delivery and will arrive soon.`,

  orderDelivered: (orderId) =>
    `Your FarmTatva order #${orderId} has been delivered. Thank you for shopping with us!`,
};
