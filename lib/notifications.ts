import { salesAlertRecipients, salesReplyTo, sendEmail } from "@/lib/email";
import { buildCustomerConfirmation, buildSalesAlert } from "@/lib/emails/orderEmails";
import type { Order } from "@/lib/checkout";

/**
 * Everything that should happen when an order is placed, in one place.
 *
 * Kept separate from the checkout route so adding a channel later is a change
 * here rather than surgery on the order-creation path. LINE is the obvious
 * next one — the Messaging API through the official account, since LINE Notify
 * was shut down in March 2025.
 *
 * Never throws. The order is already committed by the time this runs; a
 * notification problem is an operational issue for us, not an error for the
 * customer who just checked out.
 */
export async function notifyNewOrder(order: Order, locale: string): Promise<void> {
  const results = await Promise.allSettled([
    (async () => {
      const { subject, html } = await buildSalesAlert(order, locale);
      return sendEmail({
        to: salesAlertRecipients,
        subject,
        html,
        // Replying to the alert reaches the customer directly, which is what
        // sales instinctively tries to do.
        replyTo: order.shipping.email,
      });
    })(),
    (async () => {
      const { subject, html } = await buildCustomerConfirmation(order, locale);
      return sendEmail({
        to: order.shipping.email,
        subject,
        html,
        replyTo: salesReplyTo,
      });
    })(),
  ]);

  results.forEach((result, index) => {
    const label = index === 0 ? "sales alert" : "customer confirmation";
    if (result.status === "rejected") {
      console.error(`[notify] ${label} failed for ${order.id}:`, result.reason);
    } else if (result.value === false) {
      console.warn(`[notify] ${label} not sent for ${order.id}`);
    }
  });
}
