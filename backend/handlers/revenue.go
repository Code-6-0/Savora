package handlers

import (
	"encoding/csv"
	"fmt"
	"strconv"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/savora/backend/database"
	"github.com/savora/backend/models"
)

// GetRevenueHandler - GET /api/admin/revenue (admin only)
// Dashboard keuangan platform: total revenue, breakdown per source, trend bulanan
func GetRevenueHandler(c *fiber.Ctx) error {
	// Query semua platform revenue
	var revenues []models.PlatformRevenue
	if err := database.DB.Order("created_at desc").Find(&revenues).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "INTERNAL_ERROR", Message: "Gagal mengambil data revenue"},
		})
	}

	// Hitung total revenue
	var totalServiceFee float64
	var totalFromOrders float64
	var totalFromAds float64
	orderCount := 0
	adCount := 0

	for _, rev := range revenues {
		totalServiceFee += rev.ServiceFeeAmount
		if rev.SourceType == models.RevenueSourceOrder {
			totalFromOrders += rev.ServiceFeeAmount
			orderCount++
		} else if rev.SourceType == models.RevenueSourceAdvertisement {
			totalFromAds += rev.ServiceFeeAmount
			adCount++
		}
	}

	// Breakdown per bulan (6 bulan terakhir)
	monthlyData := make(map[string]float64) // "2026-07" => total_service_fee
	now := time.Now()
	for i := 5; i >= 0; i-- {
		month := now.AddDate(0, -i, 0).Format("2006-01")
		monthlyData[month] = 0
	}

	for _, rev := range revenues {
		month := rev.CreatedAt.Format("2006-01")
		if _, exists := monthlyData[month]; exists {
			monthlyData[month] += rev.ServiceFeeAmount
		}
	}

	// Convert map ke array untuk chart
	type MonthlyRevenue struct {
		Month   string  `json:"month"`
		Revenue float64 `json:"revenue"`
	}
	var monthlyArray []MonthlyRevenue
	for i := 5; i >= 0; i-- {
		month := now.AddDate(0, -i, 0).Format("2006-01")
		monthlyArray = append(monthlyArray, MonthlyRevenue{
			Month:   month,
			Revenue: monthlyData[month],
		})
	}

	return c.JSON(APIResponse{
		Success: true,
		Data: fiber.Map{
			"total_service_fee": totalServiceFee,
			"from_orders":       totalFromOrders,
			"from_ads":          totalFromAds,
			"order_count":       orderCount,
			"ad_count":          adCount,
			"monthly_trend":     monthlyArray,
		},
		Error: nil,
	})
}

// ExportRevenueHandler - GET /api/admin/revenue/export?format=csv|excel|pdf&start=YYYY-MM-DD&end=YYYY-MM-DD
// Export laporan keuangan dengan date range
func ExportRevenueHandler(c *fiber.Ctx) error {
	format := c.Query("format", "csv") // csv, excel, atau pdf
	startDate := c.Query("start")
	endDate := c.Query("end")

	// Parse date range (optional)
	query := database.DB.Model(&models.PlatformRevenue{})
	if startDate != "" {
		start, err := time.Parse("2006-01-02", startDate)
		if err == nil {
			query = query.Where("created_at >= ?", start)
		}
	}
	if endDate != "" {
		end, err := time.Parse("2006-01-02", endDate)
		if err == nil {
			// Set ke akhir hari (23:59:59)
			endOfDay := end.Add(23*time.Hour + 59*time.Minute + 59*time.Second)
			query = query.Where("created_at <= ?", endOfDay)
		}
	}

	// Query revenues
	var revenues []models.PlatformRevenue
	if err := query.Order("created_at desc").Find(&revenues).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "INTERNAL_ERROR", Message: "Gagal mengambil data revenue"},
		})
	}

	// Generate export berdasarkan format
	switch format {
	case "csv":
		return exportRevenueCSV(c, revenues, startDate, endDate)
	case "excel":
		return c.Status(fiber.StatusNotImplemented).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "NOT_IMPLEMENTED", Message: "Excel export belum tersedia. Gunakan CSV untuk sementara."},
		})
	case "pdf":
		return c.Status(fiber.StatusNotImplemented).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "NOT_IMPLEMENTED", Message: "PDF export belum tersedia. Gunakan CSV untuk sementara."},
		})
	default:
		return c.Status(fiber.StatusBadRequest).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "INVALID_FORMAT", Message: "Format tidak valid. Gunakan csv, excel, atau pdf"},
		})
	}
}

// exportRevenueCSV generates CSV export
func exportRevenueCSV(c *fiber.Ctx, revenues []models.PlatformRevenue, startDate, endDate string) error {
	// Set headers untuk download
	filename := fmt.Sprintf("revenue_export_%s.csv", time.Now().Format("20060102_150405"))
	c.Set("Content-Type", "text/csv")
	c.Set("Content-Disposition", fmt.Sprintf("attachment; filename=%s", filename))

	// Create CSV writer
	writer := csv.NewWriter(c)
	defer writer.Flush()

	// Write header
	header := []string{"ID", "Tanggal", "Tipe Sumber", "ID Sumber", "Subtotal", "Service Fee", "Deskripsi"}
	if err := writer.Write(header); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "INTERNAL_ERROR", Message: "Gagal membuat CSV"},
		})
	}

	// Write data rows
	for _, rev := range revenues {
		row := []string{
			strconv.FormatUint(uint64(rev.ID), 10),
			rev.CreatedAt.Format("2006-01-02 15:04:05"),
			rev.SourceType,
			strconv.FormatUint(uint64(rev.SourceID), 10),
			fmt.Sprintf("%.2f", rev.Amount),
			fmt.Sprintf("%.2f", rev.ServiceFeeAmount),
			rev.Description,
		}
		if err := writer.Write(row); err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(APIResponse{
				Success: false,
				Data:    nil,
				Error:   &ErrorInfo{Code: "INTERNAL_ERROR", Message: "Gagal menulis data CSV"},
			})
		}
	}

	// Write summary footer
	var totalServiceFee float64
	var totalAmount float64
	for _, rev := range revenues {
		totalServiceFee += rev.ServiceFeeAmount
		totalAmount += rev.Amount
	}

	writer.Write([]string{}) // Empty row
	writer.Write([]string{"TOTAL", "", "", "", fmt.Sprintf("%.2f", totalAmount), fmt.Sprintf("%.2f", totalServiceFee), ""})

	return nil
}
