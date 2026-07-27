/**
 * help-articles.js — Data terstruktur untuk Pusat Bantuan Savora
 *
 * Menambah artikel baru: cukup tambahkan entry di `articles` dan (bila perlu)
 * tambahkan referensinya di `sidebarMenu`. Komponen sidebar & konten membaca
 * dari file ini saja — tidak perlu menyentuh komponen.
 *
 * Catatan: Content berupa function yang menerima `{ LinkTo, ArticleLink }`
 *   - LinkTo(href, text): <Link> ke route Next.js
 *   - ArticleLink(articleId, text): link internal ke artikel lain di sidebar
 */

// =========================================================================
// SIDEBAR MENU STRUCTURE
// =========================================================================
// Setiap entry punya `id`, `title`, dan salah satu:
//   - `articleId`: langsung membuka artikel (tanpa subitem)
//   - `subitems`: array subitem yang masing-masing punya articleId
export const sidebarMenu = [
  {
    id: "belanja-di-savora",
    title: "Belanja di Savora",
    articleId: "belanja-di-savora",
  },
  {
    id: "penawaran-hadiah",
    title: "Penawaran & Hadiah",
    articleId: "penawaran-hadiah",
  },
  {
    id: "pembayaran",
    title: "Pembayaran",
    articleId: "pembayaran",
  },
  {
    id: "pesanan-pengiriman",
    title: "Pesanan & Pengiriman",
    articleId: "pesanan-pengiriman",
  },
  {
    id: "pengembalian",
    title: "Pengembalian Barang & Dana",
    articleId: "pengembalian",
  },
  {
    id: "informasi-umum",
    title: "Informasi Umum",
    subitems: [
      { id: "akun-savora", title: "Akun Savora", articleId: "akun-savora" },
      { id: "situs-savora", title: "Situs Savora", articleId: "situs-savora" },
      { id: "panduan", title: "Panduan", articleId: "panduan" },
      { id: "bantuan", title: "Bantuan", articleId: "bantuan" },
      { id: "layanan-lainnya", title: "Layanan Lainnya", articleId: "layanan-lainnya" },
      { id: "aplikasi-savora", title: "Aplikasi Savora (Android/iOS)", articleId: "aplikasi-savora" },
    ],
  },
];

// Default article ID saat halaman dibuka tanpa query
export const DEFAULT_ARTICLE_ID = "situs-savora";

// =========================================================================
// ARTICLES
// =========================================================================
// `searchText` digunakan untuk pencarian client-side (plain text).
// `Content` adalah React component function yang menerima helper props.

export const articles = {
  // ------------------------------------------------------------------
  // 1. Belanja di Savora
  // ------------------------------------------------------------------
  "belanja-di-savora": {
    id: "belanja-di-savora",
    category: "Belanja di Savora",
    title: "Cara Berbelanja di Savora",
    searchText:
      "Berbelanja di Savora sama mudahnya dengan berbelanja online pada umumnya bedanya setiap pembelian Anda ikut menyelamatkan makanan dari terbuang sia-sia. Telusuri Marketplace Savora pilih produk surplus dari mitra UMKM di sekitarmu masukkan ke keranjang lalu selesaikan pembayaran. Produk yang dijual adalah kelebihan stok makanan berkualitas Roti Kue Makanan Siap Saji Bahan Segar dan lainnya. Karena sifatnya surplus stok setiap menu terbatas dan berganti setiap hari pastikan Anda memesan sebelum kehabisan. Perhatikan informasi best before dan catatan penjual pada setiap produk untuk memastikan makanan dikonsumsi pada waktu terbaiknya.",
    Content: ({ LinkTo }) => (
      <>
        <p>
          Berbelanja di Savora sama mudahnya dengan berbelanja <em>online</em>{" "}
          pada umumnya — bedanya, setiap pembelian Anda ikut menyelamatkan
          makanan dari terbuang sia-sia. Telusuri{" "}
          <LinkTo href="/marketplace">Marketplace Savora</LinkTo>, pilih produk
          surplus dari mitra UMKM di sekitarmu, masukkan ke keranjang, lalu
          selesaikan pembayaran.
        </p>
        <p>
          Produk yang dijual adalah kelebihan stok makanan berkualitas: Roti &amp;
          Kue, Makanan Siap Saji, Bahan Segar, dan lainnya. Karena sifatnya
          surplus, stok setiap menu terbatas dan berganti setiap hari — pastikan
          Anda memesan sebelum kehabisan.
        </p>
        <p>
          Perhatikan informasi <em>best before</em> dan catatan penjual pada
          setiap produk untuk memastikan makanan dikonsumsi pada waktu
          terbaiknya.
        </p>
      </>
    ),
  },

  // ------------------------------------------------------------------
  // 2. Penawaran & Hadiah
  // ------------------------------------------------------------------
  "penawaran-hadiah": {
    id: "penawaran-hadiah",
    category: "Penawaran & Hadiah",
    title: "Promo, Flash Sale, dan Hadiah Savora",
    searchText:
      "Savora menghadirkan berbagai macam promo agar makanan surplus semakin terjangkau. Temukan Flash Sale harian dengan potongan hingga 50% kumpulkan voucher dari mitra UMKM favoritmu dan pantau penawaran eksklusif saat Live Streaming Savora berlangsung. Setiap transaksi juga bisa menghasilkan poin yang dapat ditukarkan dengan Hadiah Savora. Semakin sering Anda menyelamatkan makanan semakin banyak keuntungan yang Anda dapatkan hemat di kantong baik untuk bumi.",
    Content: ({ LinkTo }) => (
      <>
        <p>
          Savora menghadirkan{" "}
          <LinkTo href="/marketplace">berbagai macam promo</LinkTo> agar makanan
          surplus semakin terjangkau. Temukan Flash Sale harian dengan potongan
          hingga 50%, kumpulkan voucher dari mitra UMKM favoritmu, dan pantau
          penawaran eksklusif saat <em>Live Streaming</em> Savora berlangsung.
        </p>
        <p>
          Setiap transaksi juga bisa menghasilkan poin yang dapat ditukarkan
          dengan Hadiah Savora. Semakin sering Anda menyelamatkan makanan,
          semakin banyak keuntungan yang Anda dapatkan — hemat di kantong, baik
          untuk bumi.
        </p>
      </>
    ),
  },

  // ------------------------------------------------------------------
  // 3. Pembayaran
  // ------------------------------------------------------------------
  pembayaran: {
    id: "pembayaran",
    category: "Pembayaran",
    title: "Metode Pembayaran di Savora",
    searchText:
      "Savora mendukung berbagai metode pembayaran yang aman dan bebas risiko transfer bank virtual account e-wallet dan QRIS. Seluruh transaksi dilindungi Garansi Savora dana Anda baru diteruskan ke penjual setelah pesanan dikonfirmasi diterima. Apabila pembayaran gagal atau status pesanan tidak berubah setelah membayar jangan melakukan pembayaran ulang. Periksa riwayat transaksi Anda terlebih dahulu atau hubungi Bantuan Savora dengan menyertakan bukti pembayaran.",
    Content: ({ ArticleLink }) => (
      <>
        <p>
          Savora mendukung berbagai metode pembayaran yang aman dan bebas
          risiko: transfer bank/virtual account, e-wallet, dan QRIS. Seluruh
          transaksi dilindungi{" "}
          <ArticleLink articleId="bantuan">Garansi Savora</ArticleLink> — dana
          Anda baru diteruskan ke penjual setelah pesanan dikonfirmasi diterima.
        </p>
        <p>
          Apabila pembayaran gagal atau status pesanan tidak berubah setelah
          membayar, jangan melakukan pembayaran ulang. Periksa riwayat transaksi
          Anda terlebih dahulu, atau hubungi{" "}
          <ArticleLink articleId="bantuan">Bantuan Savora</ArticleLink> dengan
          menyertakan bukti pembayaran.
        </p>
      </>
    ),
  },

  // ------------------------------------------------------------------
  // 4. Pesanan & Pengiriman
  // ------------------------------------------------------------------
  "pesanan-pengiriman": {
    id: "pesanan-pengiriman",
    category: "Pesanan & Pengiriman",
    title: "Melacak Pesanan dan Pengiriman",
    searchText:
      "Setelah pembayaran berhasil penjual akan menyiapkan pesanan Anda. Anda dapat melacak status pesanan secara real-time mulai dari dikonfirmasi disiapkan hingga siap diambil atau diantar. Karena produk Savora adalah makanan surplus yang harus segera dinikmati sebagian mitra UMKM menyediakan opsi pickup langsung di toko pada rentang waktu tertentu. Pastikan Anda mengambil pesanan sesuai jadwal agar kualitas makanan tetap terjaga.",
    Content: ({ ArticleLink }) => (
      <>
        <p>
          Setelah pembayaran berhasil, penjual akan menyiapkan pesanan Anda.
          Anda dapat{" "}
          <ArticleLink articleId="pesanan-pengiriman">
            melacak status pesanan
          </ArticleLink>{" "}
          secara <em>real-time</em> — mulai dari dikonfirmasi, disiapkan,
          hingga siap diambil atau diantar.
        </p>
        <p>
          Karena produk Savora adalah makanan surplus yang harus segera
          dinikmati, sebagian mitra UMKM menyediakan opsi <em>pickup</em>{" "}
          langsung di toko pada rentang waktu tertentu. Pastikan Anda mengambil
          pesanan sesuai jadwal agar kualitas makanan tetap terjaga.
        </p>
      </>
    ),
  },

  // ------------------------------------------------------------------
  // 5. Pengembalian Barang & Dana
  // ------------------------------------------------------------------
  pengembalian: {
    id: "pengembalian",
    category: "Pengembalian Barang & Dana",
    title: "Kebijakan Pengembalian di Savora",
    searchText:
      "Kepuasan dan keamanan Anda adalah prioritas kami. Apabila pesanan yang diterima tidak sesuai deskripsi rusak atau tidak layak konsumsi Anda dapat mengajukan komplain melalui halaman detail pesanan maksimal 1x24 jam setelah pesanan diterima. Lampirkan foto produk dan keterangan masalah. Tim Savora akan meninjau pengajuan Anda dan apabila disetujui dana akan dikembalikan penuh melalui metode pembayaran awal. Perlu diingat karena sifat produk adalah makanan surplus dengan masa konsumsi terbatas pembatalan sepihak setelah pesanan disiapkan tidak dapat dikembalikan dananya.",
    Content: () => (
      <>
        <p>
          Kepuasan dan keamanan Anda adalah prioritas kami. Apabila pesanan
          yang diterima tidak sesuai deskripsi, rusak, atau tidak layak
          konsumsi, Anda dapat mengajukan komplain melalui halaman detail
          pesanan maksimal 1×24 jam setelah pesanan diterima.
        </p>
        <p>
          Lampirkan foto produk dan keterangan masalah. Tim Savora akan
          meninjau pengajuan Anda, dan apabila disetujui, dana akan
          dikembalikan penuh melalui metode pembayaran awal. Perlu diingat:
          karena sifat produk adalah makanan surplus dengan masa konsumsi
          terbatas, pembatalan sepihak setelah pesanan disiapkan tidak dapat
          dikembalikan dananya.
        </p>
      </>
    ),
  },

  // ------------------------------------------------------------------
  // 6a. Informasi Umum → Akun Savora
  // ------------------------------------------------------------------
  "akun-savora": {
    id: "akun-savora",
    category: "Informasi Umum",
    title: "Mengelola Akun Savora Anda",
    searchText:
      "Untuk mulai berbelanja daftarkan diri Anda dengan email atau nomor ponsel aktif. Melalui halaman profil Anda dapat memperbarui data diri alamat metode pembayaran favorit dan preferensi notifikasi. Ingin lebih dari sekadar belanja Anda dapat mengajukan upgrade akun menjadi Mitra UMKM untuk menjual produk surplus atau mendaftar sebagai Mitra Donasi untuk membantu menyalurkan makanan berlebih kepada yang membutuhkan.",
    Content: () => (
      <>
        <p>
          Untuk mulai berbelanja, daftarkan diri Anda dengan email atau nomor
          ponsel aktif. Melalui halaman profil, Anda dapat memperbarui data
          diri, alamat, metode pembayaran favorit, dan preferensi notifikasi.
        </p>
        <p>
          Ingin lebih dari sekadar belanja? Anda dapat mengajukan upgrade akun
          menjadi <strong>Mitra UMKM</strong> untuk menjual produk surplus,
          atau mendaftar sebagai <strong>Mitra Donasi</strong> untuk membantu
          menyalurkan makanan berlebih kepada yang membutuhkan.
        </p>
      </>
    ),
  },

  // ------------------------------------------------------------------
  // 6b. Informasi Umum → Situs Savora ("Apa itu Savora?" — existing)
  // ------------------------------------------------------------------
  "situs-savora": {
    id: "situs-savora",
    category: "Informasi Umum",
    title: "Apa itu Savora?",
    searchText:
      "Savora adalah sebuah platform circular economy di mana Anda bisa berbelanja berbagai kelebihan stok makanan berkualitas yang sudah Anda kenal sekaligus menemukan toko dan penjual baru secara online dengan harga lebih hemat. Temukan produk kebutuhan sehari-hari di Marketplace Savora atau telusuri pilihan produk dari berbagai kategori termasuk Roti Kue Makanan Siap Saji Bahan Segar dan lainnya. Anda juga dapat menemukan berbagai macam promo di Savora. Temukan penawaran Flash Sale harian main game untuk memenangkan Hadiah Savora atau tonton Live Streaming Savora dengan penawaran eksklusif saat streaming berlangsung. Apakah Anda seorang Penjual pelajari lebih lanjut tentang berbagai program Penjual atau kunjungi Pusat Edukasi Penjual untuk memulai bisnis Anda di Savora.",
    Content: ({ LinkTo }) => (
      <>
        <p>
          Savora adalah sebuah <em>platform circular economy</em> di mana Anda
          bisa berbelanja berbagai kelebihan stok makanan berkualitas yang sudah
          Anda kenal, sekaligus menemukan toko dan penjual baru secara{" "}
          <em>online</em> dengan harga lebih hemat.
        </p>
        <p>
          Temukan produk kebutuhan sehari-hari di{" "}
          <LinkTo href="/marketplace">Marketplace Savora</LinkTo>, atau
          telusuri pilihan produk dari berbagai kategori termasuk Roti &amp;
          Kue, Makanan Siap Saji, Bahan Segar, dan lainnya.
        </p>
        <p>
          Anda juga dapat menemukan{" "}
          <LinkTo href="/marketplace">berbagai macam promo di Savora</LinkTo>.
          Temukan penawaran Flash Sale harian, main <em>game</em> untuk
          memenangkan Hadiah Savora, atau tonton <em>Live Streaming</em> Savora
          dengan penawaran eksklusif saat <em>streaming</em> berlangsung.
        </p>
        <p>
          Saat Anda akan melakukan pembelian, pastikan Anda melakukannya dengan
          aman dan lancar. Anda dapat menelusuri{" "}
          <LinkTo href="/marketplace">peringkat dan ulasan produk</LinkTo>,
          melakukan pembayaran bebas risiko dengan{" "}
          <LinkTo href="/marketplace">Garansi Savora</LinkTo>, dan{" "}
          <LinkTo href="/marketplace">melacak pengiriman produk Anda</LinkTo>{" "}
          tanpa repot.
        </p>
        <p>
          Untuk informasi lebih lanjut, telusuri artikel Pusat Bantuan kami
          tentang berbelanja di Savora.
        </p>

        <hr className="tentang-article-divider" />

        <h3>Apakah Anda seorang Penjual?</h3>
        <p>
          Apabila Anda ingin berjualan di Savora,{" "}
          <LinkTo href="/gabung-umkm">
            pelajari lebih lanjut tentang berbagai program Penjual
          </LinkTo>{" "}
          atau kunjungi{" "}
          <LinkTo href="/gabung-umkm">Pusat Edukasi Penjual</LinkTo> untuk
          memulai bisnis Anda di Savora.
        </p>
      </>
    ),
  },

  // ------------------------------------------------------------------
  // 6c. Informasi Umum → Panduan
  // ------------------------------------------------------------------
  panduan: {
    id: "panduan",
    category: "Informasi Umum",
    title: "Panduan Memulai di Savora",
    searchText:
      "Baru pertama kali menggunakan Savora Mulai dari sini buat akun atur alamat kamu agar kami bisa menampilkan mitra UMKM terdekat telusuri menu surplus di Marketplace pesan dan bayar lalu ambil atau terima pesananmu. Setiap transaksi yang selesai otomatis tercatat sebagai kontribusimu dalam mengurangi food waste.",
    Content: () => (
      <>
        <p>
          Baru pertama kali menggunakan Savora? Mulai dari sini: (1) buat akun,
          (2) atur alamat kamu agar kami bisa menampilkan mitra UMKM terdekat,
          (3) telusuri menu surplus di Marketplace, (4) pesan dan bayar, lalu
          (5) ambil atau terima pesananmu. Setiap transaksi yang selesai
          otomatis tercatat sebagai kontribusimu dalam mengurangi food waste.
        </p>
      </>
    ),
  },

  // ------------------------------------------------------------------
  // 6d. Informasi Umum → Bantuan
  // ------------------------------------------------------------------
  bantuan: {
    id: "bantuan",
    category: "Informasi Umum",
    title: "Butuh Bantuan?",
    searchText:
      "Tidak menemukan jawaban di Pusat Bantuan Tim dukungan Savora siap membantu Anda. Hubungi kami melalui email resmi Savora atau formulir kontak dan sertakan nomor pesanan bila pertanyaan Anda terkait transaksi. Kami akan merespons secepatnya pada jam operasional.",
    Content: () => (
      <>
        <p>
          Tidak menemukan jawaban di Pusat Bantuan? Tim dukungan Savora siap
          membantu Anda. Hubungi kami melalui email resmi Savora atau formulir
          kontak, dan sertakan nomor pesanan bila pertanyaan Anda terkait
          transaksi. Kami akan merespons secepatnya pada jam operasional.
        </p>
      </>
    ),
  },

  // ------------------------------------------------------------------
  // 6e. Informasi Umum → Layanan Lainnya
  // ------------------------------------------------------------------
  "layanan-lainnya": {
    id: "layanan-lainnya",
    category: "Informasi Umum",
    title: "Layanan Lain di Ekosistem Savora",
    searchText:
      "Selain marketplace Savora juga menghadirkan program Donasi Makanan Surplus menghubungkan mitra UMKM dengan mitra donasi terverifikasi agar makanan layak yang tidak terjual tetap sampai ke yang membutuhkan serta ruang promosi bagi UMKM untuk menjangkau lebih banyak pelanggan. Pelajari cara menjadi Mitra Donasi.",
    Content: ({ LinkTo }) => (
      <>
        <p>
          Selain marketplace, Savora juga menghadirkan program{" "}
          <strong>Donasi Makanan Surplus</strong> — menghubungkan mitra UMKM
          dengan mitra donasi terverifikasi agar makanan layak yang tidak
          terjual tetap sampai ke yang membutuhkan — serta ruang promosi bagi
          UMKM untuk menjangkau lebih banyak pelanggan.{" "}
          <LinkTo href="/mitra-donasi/register">
            Pelajari cara menjadi Mitra Donasi
          </LinkTo>
          .
        </p>
      </>
    ),
  },

  // ------------------------------------------------------------------
  // 6f. Informasi Umum → Aplikasi Savora
  // ------------------------------------------------------------------
  "aplikasi-savora": {
    id: "aplikasi-savora",
    category: "Informasi Umum",
    title: "Aplikasi Savora untuk Android & iOS",
    searchText:
      "Aplikasi mobile Savora saat ini sedang dalam tahap pengembangan. Untuk sementara seluruh layanan Savora dapat diakses melalui situs web yang sudah dioptimalkan untuk perangkat mobile buka Savora dari browser ponsel Anda dan nikmati pengalaman yang sama nyamannya. Nantikan kabar peluncuran aplikasi kami.",
    Content: () => (
      <>
        <p>
          Aplikasi mobile Savora saat ini sedang dalam tahap pengembangan. Untuk
          sementara, seluruh layanan Savora dapat diakses melalui situs web yang
          sudah dioptimalkan untuk perangkat mobile — buka Savora dari browser
          ponsel Anda dan nikmati pengalaman yang sama nyamannya. Nantikan kabar
          peluncuran aplikasi kami!
        </p>
      </>
    ),
  },
};

// =========================================================================
// HELPER: Get all articles as flat array (for search)
// =========================================================================
export function getAllArticles() {
  return Object.values(articles);
}

// =========================================================================
// HELPER: Find which sidebar section + subitem an article belongs to
// =========================================================================
export function findSidebarLocation(articleId) {
  for (let i = 0; i < sidebarMenu.length; i++) {
    const section = sidebarMenu[i];
    if (section.articleId === articleId) {
      return { sectionIndex: i, subitemId: null };
    }
    if (section.subitems) {
      const sub = section.subitems.find((s) => s.articleId === articleId);
      if (sub) {
        return { sectionIndex: i, subitemId: sub.id };
      }
    }
  }
  return null;
}
