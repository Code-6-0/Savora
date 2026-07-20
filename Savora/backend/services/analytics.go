// Package services berisi logika bisnis murni (tanpa akses DB langsung) untuk
// analitik penjualan dan iklan UMKM. Fungsi-fungsi di sini menerima slice model
// sebagai input sehingga mudah diuji secara unit tanpa koneksi database.
package services

import (
	"sort"
	"time"

	"github.com/savora/backend/models"
)

// ProductSales — ringkasan penjualan satu produk hasil agregasi OrderItem.
type ProductSales struct {
	ProductID   uint    `json:"product_id"`
	Name        string  `json:"name"`
	Category    string  `json:"category"`
	UnitsSold   int     `json:"units_sold"`
	Revenue     float64 `json:"revenue"`
	OrdersCount int     `json:"orders_count"`
}

// TrendPoint — satu titik pada tren penjualan (per hari/minggu/bulan).
type TrendPoint struct {
	Period    string  `json:"period"` // contoh: 2026-07-19, 2026-W29, 2026-07
	Revenue   float64 `json:"revenue"`
	UnitsSold int     `json:"units_sold"`
	Orders    int     `json:"orders"`
}

// ListingMetrics — metrik performa listing yang diturunkan dari data pesanan.
// Views/clicks tidak dilacak; konversi dihitung berbasis pesanan yang terjadi.
type ListingMetrics struct {
	ProductID   uint    `json:"product_id"`
	Name        string  `json:"name"`
	UnitsSold   int     `json:"units_sold"`
	Revenue     float64 `json:"revenue"`
	OrdersCount int     `json:"orders_count"`
	StockLeft   int     `json:"stock_left"`
	SellThrough float64 `json:"sell_through"` // unit terjual / (terjual + sisa stok), 0..1
}

// UmkmInsight — insight tingkat UMKM: rating agregat + produk terlaris.
type UmkmInsight struct {
	UmkmID       uint           `json:"umkm_id"`
	AvgRating    float64        `json:"avg_rating"`
	ReviewCount  int            `json:"review_count"`
	TotalRevenue float64        `json:"total_revenue"`
	TotalUnits   int            `json:"total_units"`
	TopProducts  []ProductSales `json:"top_products"`
}

// countedOrders melacak order unik per produk agar OrdersCount akurat.
func aggregate(orders []models.Order) map[uint]*ProductSales {
	byProduct := map[uint]*ProductSales{}
	seenOrder := map[uint]map[uint]bool{} // productID -> set(orderID)

	for _, order := range orders {
		for _, item := range order.OrderItems {
			ps, ok := byProduct[item.ProductID]
			if !ok {
				ps = &ProductSales{
					ProductID: item.ProductID,
					Name:      item.Product.Name,
					Category:  item.Product.Category,
				}
				byProduct[item.ProductID] = ps
				seenOrder[item.ProductID] = map[uint]bool{}
			}
			// Nama/kategori bisa kosong bila Product tidak di-preload; isi bila ada.
			if ps.Name == "" && item.Product.Name != "" {
				ps.Name = item.Product.Name
				ps.Category = item.Product.Category
			}
			ps.UnitsSold += item.Quantity
			ps.Revenue += item.Price * float64(item.Quantity)
			if !seenOrder[item.ProductID][order.ID] {
				seenOrder[item.ProductID][order.ID] = true
				ps.OrdersCount++
			}
		}
	}
	return byProduct
}

// AggregateProductSales mengubah daftar order (dengan OrderItems ter-preload)
// menjadi ringkasan penjualan per produk, terurut dari revenue tertinggi.
func AggregateProductSales(orders []models.Order) []ProductSales {
	byProduct := aggregate(orders)

	result := make([]ProductSales, 0, len(byProduct))
	for _, ps := range byProduct {
		result = append(result, *ps)
	}
	sortByRevenueDesc(result)
	return result
}

// TopSellingProducts mengembalikan n produk terlaris berdasarkan unit terjual.
// Bila unit sama, revenue lebih tinggi diprioritaskan agar urutan stabil.
func TopSellingProducts(orders []models.Order, limit int) []ProductSales {
	sales := AggregateProductSales(orders)
	sort.SliceStable(sales, func(i, j int) bool {
		if sales[i].UnitsSold != sales[j].UnitsSold {
			return sales[i].UnitsSold > sales[j].UnitsSold
		}
		return sales[i].Revenue > sales[j].Revenue
	})
	if limit > 0 && len(sales) > limit {
		sales = sales[:limit]
	}
	return sales
}

// Granularity untuk SalesTrend.
const (
	TrendDaily   = "daily"
	TrendWeekly  = "weekly"
	TrendMonthly = "monthly"
)

// periodKey memformat waktu order menjadi kunci periode sesuai granularity.
func periodKey(t time.Time, granularity string) string {
	switch granularity {
	case TrendWeekly:
		year, week := t.ISOWeek()
		return isoWeekLabel(year, week)
	case TrendMonthly:
		return t.Format("2006-01")
	default: // daily
		return t.Format("2006-01-02")
	}
}

func isoWeekLabel(year, week int) string {
	// Format: 2006-W03 (dua digit minggu).
	w := week
	prefix := "-W"
	if w < 10 {
		prefix = "-W0"
	}
	return itoa(year) + prefix + itoa(w)
}

// SalesTrend menghitung tren penjualan per periode (daily/weekly/monthly),
// terurut menaik berdasarkan periode.
func SalesTrend(orders []models.Order, granularity string) []TrendPoint {
	byPeriod := map[string]*TrendPoint{}
	for _, order := range orders {
		key := periodKey(order.CreatedAt, granularity)
		tp, ok := byPeriod[key]
		if !ok {
			tp = &TrendPoint{Period: key}
			byPeriod[key] = tp
		}
		tp.Orders++
		for _, item := range order.OrderItems {
			tp.Revenue += item.Price * float64(item.Quantity)
			tp.UnitsSold += item.Quantity
		}
	}

	result := make([]TrendPoint, 0, len(byPeriod))
	for _, tp := range byPeriod {
		result = append(result, *tp)
	}
	sort.Slice(result, func(i, j int) bool {
		return result[i].Period < result[j].Period
	})
	return result
}

// BuildListingMetrics menggabungkan agregasi penjualan dengan daftar produk
// untuk menghasilkan metrik performa listing (termasuk sell-through vs stok).
func BuildListingMetrics(orders []models.Order, products []models.Product) []ListingMetrics {
	byProduct := aggregate(orders)

	result := make([]ListingMetrics, 0, len(products))
	for _, product := range products {
		lm := ListingMetrics{
			ProductID: product.ID,
			Name:      product.Name,
			StockLeft: product.Stock,
		}
		if ps, ok := byProduct[product.ID]; ok {
			lm.UnitsSold = ps.UnitsSold
			lm.Revenue = ps.Revenue
			lm.OrdersCount = ps.OrdersCount
		}
		denom := lm.UnitsSold + lm.StockLeft
		if denom > 0 {
			lm.SellThrough = float64(lm.UnitsSold) / float64(denom)
		}
		result = append(result, lm)
	}
	// Terurut dari performa terbaik (unit terjual terbanyak).
	sort.SliceStable(result, func(i, j int) bool {
		return result[i].UnitsSold > result[j].UnitsSold
	})
	return result
}

// BuildUmkmInsight menyusun insight tingkat UMKM: rating rata-rata dari review,
// total penjualan, dan produk terlaris.
func BuildUmkmInsight(umkmID uint, orders []models.Order, reviews []models.Review, topN int) UmkmInsight {
	insight := UmkmInsight{UmkmID: umkmID}

	var ratingSum int
	for _, r := range reviews {
		ratingSum += r.Rating
		insight.ReviewCount++
	}
	if insight.ReviewCount > 0 {
		insight.AvgRating = round2(float64(ratingSum) / float64(insight.ReviewCount))
	}

	for _, ps := range AggregateProductSales(orders) {
		insight.TotalRevenue += ps.Revenue
		insight.TotalUnits += ps.UnitsSold
	}
	insight.TopProducts = TopSellingProducts(orders, topN)
	return insight
}

func sortByRevenueDesc(sales []ProductSales) {
	sort.SliceStable(sales, func(i, j int) bool {
		return sales[i].Revenue > sales[j].Revenue
	})
}

func round2(v float64) float64 {
	return float64(int(v*100+0.5)) / 100
}

// itoa kecil tanpa import strconv agar file tetap ringkas.
func itoa(n int) string {
	if n == 0 {
		return "0"
	}
	neg := n < 0
	if neg {
		n = -n
	}
	var buf [20]byte
	i := len(buf)
	for n > 0 {
		i--
		buf[i] = byte('0' + n%10)
		n /= 10
	}
	if neg {
		i--
		buf[i] = '-'
	}
	return string(buf[i:])
}
