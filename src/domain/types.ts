export const DELIVERY_STATUSES = [
  "pending_receipt",
  "received",
  "pending_delivery",
  "delivered",
  "cancelled",
] as const;

export type DeliveryStatus = (typeof DELIVERY_STATUSES)[number];

export const EXPENSE_CATEGORIES = [
  "shipping",
  "packaging",
  "advertising",
  "commission",
  "other",
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];
