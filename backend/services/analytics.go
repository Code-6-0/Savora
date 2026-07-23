package services

import (
	"github.com/savora/backend/models"
)

// Stub file - analytics implementation by Rifaidi
// TODO: Update when new Order model is integrated

type ProductSales struct {
	ProductID   uint    `json:"product_id"`
	Name        string  `json:"name"`
	Category    string  `json:"category"`
	UnitsSold   int     `json:"units_sold"`
	Revenue     float64 `json:"revenue"`
	OrdersCount int     `json:"orders_count"`
}

func AggregateProductSales(orders []models.Order) []ProductSales {
	return []ProductSales{}
}

func TopSellingProducts(orders []models.Order, limit int) []ProductSales {
	return []ProductSales{}
}

// Stub types untuk handler compatibility
type TrendPeriod string
const (
	TrendDaily   TrendPeriod = "daily"
	TrendWeekly  TrendPeriod = "weekly"
	TrendMonthly TrendPeriod = "monthly"
)

type TrendPoint struct {
	Period    string  `json:"period"`
	Revenue   float64 `json:"revenue"`
	UnitsSold int     `json:"units_sold"`
	Orders    int     `json:"orders"`
}

type UmkmInsight struct {
	UmkmID       uint              `json:"umkm_id"`
	AvgRating    float64           `json:"avg_rating"`
	ReviewCount  int               `json:"review_count"`
	TotalRevenue float64           `json:"total_revenue"`
	TotalUnits   int               `json:"total_units"`
	TopProducts  []ProductSales    `json:"top_products"`
}

type ListingMetrics struct {
	ProductID   uint    `json:"product_id"`
	Name        string  `json:"name"`
	UnitsSold   int     `json:"units_sold"`
	Revenue     float64 `json:"revenue"`
	OrdersCount int     `json:"orders_count"`
	StockLeft   int     `json:"stock_left"`
	SellThrough float64 `json:"sell_through"`
}

func SalesTrend(orders []models.Order, period TrendPeriod) []TrendPoint {
	return []TrendPoint{}
}

func BuildUmkmInsight(umkmID uint, orders []models.Order, reviews []models.Review) UmkmInsight {
	return UmkmInsight{UmkmID: umkmID}
}

func BuildListingMetrics(umkmID uint, orders []models.Order, products []models.Product) []ListingMetrics {
	return []ListingMetrics{}
}
