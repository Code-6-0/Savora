// Impact Tracking — Richard Firmansyah (Customer Dashboard)
//
// Helper murni untuk menghitung ringkasan dampak personal customer
// berdasarkan data order. Sesuai PRD Section 16 & FR-13 (P1):
// ringkasan impact sederhana berbasis data riil.
//
// Grafik impact agregat & monthly story = Demo Only (PRD 9.3, REVISI #24),
// jadi modul ini TIDAK menyediakan data untuk chart.

const KG_PER_PORTION = 0.4;

/**
 * Hitung ringkasan dampak personal customer dari daftar order.
 *
 * Hanya order berstatus **Completed** yang dihitung (PRD 14.1: order
 * selesai = pickup code valid & transaksi selesai).
 *
 * @param {Array<{
 *   status?: string,
 *   quantity?: number,
 *   original_price?: number,
 *   rescue_price?: number,
 * }>} orders daftar order customer.
 * @returns {{
 *   totalPortions: number,
 *   totalSaved: number,
 *   estimatedKg: number,
 * }}
 */
export function computeImpactSummary(orders) {
  const list = Array.isArray(orders) ? orders : [];

  let totalPortions = 0;
  let totalSaved = 0;

  for (const order of list) {
    // Hanya hitung order yang sudah Completed (case-insensitive).
    const status = String(order?.status ?? "").trim().toLowerCase();
    if (status !== "completed") continue;

    const qty = Number(order.quantity);
    const portions = Number.isFinite(qty) && qty > 0 ? qty : 0;

    const original = Number(order.original_price);
    const rescue = Number(order.rescue_price);

    // Hitung hemat per item: selisih harga asli − harga rescue.
    // Jika salah satu field harga tidak valid/hilang, anggap hemat 0
    // untuk item tersebut agar tidak merusak total.
    let savedPerItem = 0;
    if (Number.isFinite(original) && Number.isFinite(rescue) && original > rescue) {
      savedPerItem = original - rescue;
    }

    totalPortions += portions;
    totalSaved += savedPerItem * portions;
  }

  return {
    totalPortions,
    totalSaved,
    estimatedKg: +(totalPortions * KG_PER_PORTION).toFixed(1),
  };
}
