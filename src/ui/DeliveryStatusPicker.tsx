"use client";

import { DELIVERY_STATUSES, type DeliveryStatus } from "@/domain/types";
import { deliveryStatusLabel } from "@/ui/labels";
import { updateDeliveryStatusAction } from "@/actions/orders";

export function DeliveryStatusPicker({
  orderId,
  current,
}: {
  orderId: string;
  current: DeliveryStatus;
}) {
  return (
    <form action={updateDeliveryStatusAction}>
      <input type="hidden" name="orderId" value={orderId} />
      <select
        name="deliveryStatus"
        defaultValue={current}
        onChange={(event) => event.currentTarget.form?.requestSubmit()}
        aria-label="Estado de entrega"
        className="rounded-full border border-line bg-surface px-3 py-1.5 text-sm font-semibold"
      >
        {DELIVERY_STATUSES.map((status) => (
          <option key={status} value={status}>
            {deliveryStatusLabel(status)}
          </option>
        ))}
      </select>
    </form>
  );
}
