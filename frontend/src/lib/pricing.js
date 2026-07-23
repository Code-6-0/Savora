// Pricing — Richard Firmansyah (Batch 2, sisi customer)
//
// Helper murni untuk perhitungan harga final sesuai PRD 13.3 & 14.4:
// service fee 5% DITAMBAHKAN ke total pembayaran customer.
// Harga final harus jelas sebelum checkout (PRD 13.3 Guardrail).

/** Persentase service fee platform (PRD 14.4). */
export const SERVICE_FEE_PERCENT = 5;

/**
 * Hitung rincian harga final untuk checkout.
 *
 * @param {number} unitPrice  harga rescue per porsi (rescue_price).
 * @param {number} quantity   jumlah porsi.
 * @returns {{ subtotal: number, serviceFee: number, total: number }}
 */
export function computeCheckoutPricing(unitPrice, quantity) {
  const price = Math.max(0, Math.floor(Number(unitPrice) || 0));
  const qty = Math.max(1, Math.floor(Number(quantity) || 1));
  const subtotal = price * qty;
  const serviceFee = Math.round(subtotal * SERVICE_FEE_PERCENT / 100);
  const total = subtotal + serviceFee;
  return { subtotal, serviceFee, total };
}
