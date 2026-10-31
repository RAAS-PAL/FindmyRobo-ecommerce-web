import { asQuote, type QuoteRequest } from "@/lib/quoteRequest";

/** Both quote interfaces use the same payload and customer-facing outcomes. */
export async function submitQuote(
  quote: QuoteRequest,
  locale: string
): Promise<"sent" | "rateLimited" | "sendError"> {
  try {
    const response = await fetch("/api/quotes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quote: asQuote(quote), locale }),
    });
    if (response.status === 429) return "rateLimited";
    return response.ok ? "sent" : "sendError";
  } catch {
    return "sendError";
  }
}
