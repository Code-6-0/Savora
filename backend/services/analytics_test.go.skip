package services

import (
	"testing"
	"time"

	"github.com/savora/backend/models"
)

// sampleOrders membangun order dengan OrderItems ter-preload untuk pengujian.
func sampleOrders() []models.Order {
	nasi := models.Product{ID: 1, Name: "Nasi Kotak", Category: "Makanan"}
	roti := models.Product{ID: 2, Name: "Roti Gandum", Category: "Bakeri"}

	return []models.Order{
		{
			ID:        1,
			UmkmID:    1,
			CreatedAt: time.Date(2026, 7, 1, 10, 0, 0, 0, time.UTC),
			OrderItems: []models.OrderItem{
				{OrderID: 1, ProductID: 1, Quantity: 2, Price: 20000, Product: nasi},
				{OrderID: 1, ProductID: 2, Quantity: 1, Price: 12000, Product: roti},
			},
		},
		{
			ID:        2,
			UmkmID:    1,
			CreatedAt: time.Date(2026, 7, 1, 15, 0, 0, 0, time.UTC),
			OrderItems: []models.OrderItem{
				{OrderID: 2, ProductID: 1, Quantity: 3, Price: 20000, Product: nasi},
			},
		},
		{
			ID:        3,
			UmkmID:    1,
			CreatedAt: time.Date(2026, 7, 8, 9, 0, 0, 0, time.UTC),
			OrderItems: []models.OrderItem{
				{OrderID: 3, ProductID: 2, Quantity: 5, Price: 12000, Product: roti},
			},
		},
	}
}

func findSales(sales []ProductSales, id uint) (ProductSales, bool) {
	for _, s := range sales {
		if s.ProductID == id {
			return s, true
		}
	}
	return ProductSales{}, false
}

func TestAggregateProductSales(t *testing.T) {
	sales := AggregateProductSales(sampleOrders())

	nasi, ok := findSales(sales, 1)
	if !ok {
		t.Fatal("produk nasi tidak ditemukan")
	}
	// 2 + 3 unit = 5 unit; revenue 5*20000 = 100000; muncul di 2 order.
	if nasi.UnitsSold != 5 {
		t.Errorf("units nasi = %d, want 5", nasi.UnitsSold)
	}
	if nasi.Revenue != 100000 {
		t.Errorf("revenue nasi = %v, want 100000", nasi.Revenue)
	}
	if nasi.OrdersCount != 2 {
		t.Errorf("orders nasi = %d, want 2", nasi.OrdersCount)
	}

	roti, _ := findSales(sales, 2)
	// 1 + 5 unit = 6 unit; revenue 6*12000 = 72000.
	if roti.UnitsSold != 6 || roti.Revenue != 72000 {
		t.Errorf("roti = %+v, want 6 unit / 72000", roti)
	}

	// Terurut revenue desc: nasi (100000) sebelum roti (72000).
	if sales[0].ProductID != 1 {
		t.Errorf("urutan revenue salah, sales[0]=%d", sales[0].ProductID)
	}
}

func TestTopSellingProducts(t *testing.T) {
	top := TopSellingProducts(sampleOrders(), 1)
	if len(top) != 1 {
		t.Fatalf("limit tidak dihormati, len=%d", len(top))
	}
	// Roti terjual 6 unit > nasi 5 unit, jadi roti nomor 1 by units.
	if top[0].ProductID != 2 {
		t.Errorf("top product = %d, want 2 (roti)", top[0].ProductID)
	}
}

func TestSalesTrendDaily(t *testing.T) {
	trend := SalesTrend(sampleOrders(), TrendDaily)
	if len(trend) != 2 {
		t.Fatalf("expected 2 hari, got %d", len(trend))
	}
	// 2026-07-01 punya 2 order; revenue = (2*20000+1*12000)+(3*20000) = 112000.
	if trend[0].Period != "2026-07-01" {
		t.Errorf("period[0] = %s", trend[0].Period)
	}
	if trend[0].Orders != 2 {
		t.Errorf("orders hari 1 = %d, want 2", trend[0].Orders)
	}
	if trend[0].Revenue != 112000 {
		t.Errorf("revenue hari 1 = %v, want 112000", trend[0].Revenue)
	}
}

func TestSalesTrendMonthly(t *testing.T) {
	trend := SalesTrend(sampleOrders(), TrendMonthly)
	if len(trend) != 1 || trend[0].Period != "2026-07" {
		t.Fatalf("monthly trend = %+v", trend)
	}
	// total revenue seluruh order = 112000 + 60000 = 172000.
	if trend[0].Revenue != 172000 {
		t.Errorf("revenue bulan = %v, want 172000", trend[0].Revenue)
	}
}

func TestBuildListingMetrics(t *testing.T) {
	products := []models.Product{
		{ID: 1, Name: "Nasi Kotak", Stock: 5},
		{ID: 2, Name: "Roti Gandum", Stock: 0},
		{ID: 3, Name: "Produk Tanpa Penjualan", Stock: 10},
	}
	metrics := BuildListingMetrics(sampleOrders(), products)

	var nasi, kosong ListingMetrics
	for _, m := range metrics {
		if m.ProductID == 1 {
			nasi = m
		}
		if m.ProductID == 3 {
			kosong = m
		}
	}

	// Nasi: 5 terjual, sisa 5 -> sell-through = 5/10 = 0.5.
	if nasi.SellThrough != 0.5 {
		t.Errorf("sell-through nasi = %v, want 0.5", nasi.SellThrough)
	}
	// Produk tanpa penjualan: 0 terjual, sisa 10 -> sell-through 0.
	if kosong.UnitsSold != 0 || kosong.SellThrough != 0 {
		t.Errorf("produk tanpa penjualan = %+v", kosong)
	}
}

func TestBuildUmkmInsight(t *testing.T) {
	reviews := []models.Review{
		{UmkmID: 1, Rating: 5},
		{UmkmID: 1, Rating: 4},
		{UmkmID: 1, Rating: 3},
	}
	insight := BuildUmkmInsight(1, sampleOrders(), reviews, 5)

	if insight.ReviewCount != 3 {
		t.Errorf("review count = %d, want 3", insight.ReviewCount)
	}
	if insight.AvgRating != 4 {
		t.Errorf("avg rating = %v, want 4", insight.AvgRating)
	}
	// Total revenue = 172000, total units = 5 (nasi) + 6 (roti) = 11.
	if insight.TotalRevenue != 172000 {
		t.Errorf("total revenue = %v, want 172000", insight.TotalRevenue)
	}
	if insight.TotalUnits != 11 {
		t.Errorf("total units = %d, want 11", insight.TotalUnits)
	}
	if len(insight.TopProducts) == 0 || insight.TopProducts[0].ProductID != 2 {
		t.Errorf("top product insight salah: %+v", insight.TopProducts)
	}
}

func TestEmptyInputs(t *testing.T) {
	if got := AggregateProductSales(nil); len(got) != 0 {
		t.Errorf("expected empty, got %d", len(got))
	}
	if got := SalesTrend(nil, TrendDaily); len(got) != 0 {
		t.Errorf("expected empty trend, got %d", len(got))
	}
	insight := BuildUmkmInsight(1, nil, nil, 5)
	if insight.AvgRating != 0 || insight.ReviewCount != 0 {
		t.Errorf("empty insight harus nol: %+v", insight)
	}
}
