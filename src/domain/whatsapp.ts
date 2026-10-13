import { formatMoney } from "@/domain/money";

/**
 * Normaliza un número argentino al formato que espera wa.me: `549` +
 * característica + número, sin 0 ni 15, sin espacios ni guiones.
 * `null`/vacío si no hay nada que normalizar (así la UI puede ocultar el
 * botón de WhatsApp en vez de armar un link roto).
 */
export function normalizePhone(phone: string | null | undefined): string | null {
  let digits = (phone ?? "").replace(/\D/g, "");
  if (!digits) return null;

  if (digits.startsWith("0")) digits = digits.slice(1);

  if (digits.length === 10) {
    digits = "549" + digits;
  } else if (digits.length === 12 && digits.startsWith("54") && digits[2] !== "9") {
    digits = "549" + digits.slice(2);
  }
  // 13 dígitos empezando con 549 (ya normalizado) u otro caso: se deja como está.

  return digits;
}

/** Link de wa.me con el mensaje ya armado. Sin teléfono, el link queda sin destinatario. */
export function whatsappUrl(phone: string | null | undefined, message: string): string {
  const normalized = normalizePhone(phone);
  return `https://wa.me/${normalized ?? ""}?text=${encodeURIComponent(message)}`;
}

export type WhatsAppOrderItem = {
  name: string;
  quantity: number;
  unitPrice: number;
};

export type WhatsAppOrder = {
  customerName: string;
  items: WhatsAppOrderItem[];
  total: number;
  paid: number;
  balance: number;
};

function firstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] || fullName;
}

/** Mensaje para compartir el detalle de un pedido por WhatsApp. */
export function orderMessage(order: WhatsAppOrder): string {
  const lines = order.items.map(
    (item) => `• ${item.quantity} x ${item.name} — ${formatMoney(item.quantity * item.unitPrice)}`,
  );

  let text = `¡Hola ${firstName(order.customerName)}! Te paso tu pedido:\n${lines.join("\n")}\n\nTotal: ${formatMoney(order.total)}`;
  if (order.paid > 0) text += `\nPagaste: ${formatMoney(order.paid)}`;
  text += order.balance > 0 ? `\nTe queda: ${formatMoney(order.balance)}` : `\n¡Está todo pago!`;

  return text + `\n\n¡Gracias! 💕`;
}

/** Mensaje para recordar una deuda pendiente por WhatsApp. */
export function reminderMessage(customerName: string, balance: number): string {
  return `¡Hola ${firstName(customerName)}! ¿Cómo estás? Te escribo para recordarte que te quedan ${formatMoney(balance)} pendientes de tu pedido. Podés pagarme por transferencia o en efectivo cuando te quede cómodo. ¡Gracias! 😊`;
}
