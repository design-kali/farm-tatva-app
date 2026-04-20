export const ORDER_STATUSES = {
  PENDING: {
    value: 'PENDING',
    label: 'Pending',
    color: 'text-gray-600 bg-gray-100',
  },
  CONFIRMED: {
    value: 'CONFIRMED',
    label: 'Confirmed',
    color: 'text-blue-600 bg-blue-100',
  },
  PACKED: {
    value: 'PACKED',
    label: 'Packed',
    color: 'text-blue-600 bg-blue-100',
  },
  OUT_FOR_DELIVERY: {
    value: 'OUT_FOR_DELIVERY',
    label: 'Out for Delivery',
    color: 'text-blue-600 bg-blue-100',
  },
  DELIVERED: {
    value: 'DELIVERED',
    label: 'Delivered',
    color: 'text-green-600 bg-green-100',
  },
  CANCELLED: {
    value: 'CANCELLED',
    label: 'Cancelled',
    color: 'text-red-600 bg-red-100',
  },
} as const;

export const ORDER_STATUS_VALUES = Object.values(ORDER_STATUSES).map(status => status.value);
export const ORDER_STATUS_LABELS = Object.values(ORDER_STATUSES).map(status => status.label);

export const VALID_ORDER_TRANSITIONS = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PACKED', 'CANCELLED'],
  PACKED: ['OUT_FOR_DELIVERY', 'CANCELLED'],
  OUT_FOR_DELIVERY: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
} as const;

export type OrderStatus = keyof typeof ORDER_STATUSES;