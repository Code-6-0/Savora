package handlers

import (
	"bytes"
	"encoding/csv"
	"fmt"
	"strconv"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/jung-kurt/gofpdf"
	"github.com/savora/backend/database"
	"github.com/savora/backend/models"
	"github.com/xuri/excelize/v2"
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
	case "xlsx", "excel": // xlsx (sesuai PRD), excel sebagai alias
		return exportRevenueExcel(c, revenues, startDate, endDate)
	case "pdf":
		return exportRevenuePDF(c, revenues, startDate, endDate)
	default:
		return c.Status(fiber.StatusBadRequest).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "INVALID_FORMAT", Message: "Format tidak valid. Gunakan csv, xlsx, atau pdf"},
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

// exportRevenueExcel generates Excel export
func exportRevenueExcel(c *fiber.Ctx, revenues []models.PlatformRevenue, startDate, endDate string) error {
	// Create new Excel file
	f := excelize.NewFile()
	defer func() {
		if err := f.Close(); err != nil {
			// Log error but continue
		}
	}()

	sheetName := "Revenue"
	index, err := f.NewSheet(sheetName)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "INTERNAL_ERROR", Message: "Gagal membuat file Excel"},
		})
	}
	f.SetActiveSheet(index)

	// Style untuk header
	headerStyle, _ := f.NewStyle(&excelize.Style{
		Font:      &excelize.Font{Bold: true, Color: "FFFFFF"},
		Fill:      excelize.Fill{Type: "pattern", Color: []string{"16A34A"}, Pattern: 1},
		Alignment: &excelize.Alignment{Horizontal: "center", Vertical: "center"},
		Border: []excelize.Border{
			{Type: "top", Style: 1, Color: "000000"},
			{Type: "bottom", Style: 1, Color: "000000"},
			{Type: "left", Style: 1, Color: "000000"},
			{Type: "right", Style: 1, Color: "000000"},
		},
	})

	// Set header
	headers := []string{"ID", "Tanggal", "Tipe Sumber", "ID Sumber", "Subtotal", "Service Fee", "Deskripsi"}
	for i, header := range headers {
		cell := string(rune('A'+i)) + "1"
		f.SetCellValue(sheetName, cell, header)
		f.SetCellStyle(sheetName, cell, cell, headerStyle)
	}

	// Set column widths
	f.SetColWidth(sheetName, "A", "A", 8)
	f.SetColWidth(sheetName, "B", "B", 20)
	f.SetColWidth(sheetName, "C", "C", 15)
	f.SetColWidth(sheetName, "D", "D", 12)
	f.SetColWidth(sheetName, "E", "E", 15)
	f.SetColWidth(sheetName, "F", "F", 15)
	f.SetColWidth(sheetName, "G", "G", 30)

	// Currency style
	currencyStyle, _ := f.NewStyle(&excelize.Style{
		NumFmt: 44, // Currency format
	})

	// Write data rows
	var totalServiceFee float64
	var totalAmount float64
	for i, rev := range revenues {
		row := i + 2
		f.SetCellValue(sheetName, fmt.Sprintf("A%d", row), rev.ID)
		f.SetCellValue(sheetName, fmt.Sprintf("B%d", row), rev.CreatedAt.Format("2006-01-02 15:04:05"))
		f.SetCellValue(sheetName, fmt.Sprintf("C%d", row), rev.SourceType)
		f.SetCellValue(sheetName, fmt.Sprintf("D%d", row), rev.SourceID)
		f.SetCellValue(sheetName, fmt.Sprintf("E%d", row), rev.Amount)
		f.SetCellValue(sheetName, fmt.Sprintf("F%d", row), rev.ServiceFeeAmount)
		f.SetCellValue(sheetName, fmt.Sprintf("G%d", row), rev.Description)

		// Apply currency format
		f.SetCellStyle(sheetName, fmt.Sprintf("E%d", row), fmt.Sprintf("F%d", row), currencyStyle)

		totalServiceFee += rev.ServiceFeeAmount
		totalAmount += rev.Amount
	}

	// Add summary row
	summaryRow := len(revenues) + 3
	summaryStyle, _ := f.NewStyle(&excelize.Style{
		Font: &excelize.Font{Bold: true},
		Fill: excelize.Fill{Type: "pattern", Color: []string{"E5F5EB"}, Pattern: 1},
	})
	f.SetCellValue(sheetName, fmt.Sprintf("A%d", summaryRow), "TOTAL")
	f.SetCellValue(sheetName, fmt.Sprintf("E%d", summaryRow), totalAmount)
	f.SetCellValue(sheetName, fmt.Sprintf("F%d", summaryRow), totalServiceFee)
	f.SetCellStyle(sheetName, fmt.Sprintf("A%d", summaryRow), fmt.Sprintf("G%d", summaryRow), summaryStyle)
	f.SetCellStyle(sheetName, fmt.Sprintf("E%d", summaryRow), fmt.Sprintf("F%d", summaryRow), currencyStyle)

	// Generate buffer
	buf, err := f.WriteToBuffer()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "INTERNAL_ERROR", Message: "Gagal generate Excel"},
		})
	}

	// Set headers untuk download
	filename := fmt.Sprintf("revenue_export_%s.xlsx", time.Now().Format("20060102_150405"))
	c.Set("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
	c.Set("Content-Disposition", fmt.Sprintf("attachment; filename=%s", filename))

	return c.Send(buf.Bytes())
}

// exportRevenuePDF generates PDF export
func exportRevenuePDF(c *fiber.Ctx, revenues []models.PlatformRevenue, startDate, endDate string) error {
	// Create PDF
	pdf := gofpdf.New("L", "mm", "A4", "") // Landscape orientation
	pdf.AddPage()

	// Set font
	pdf.SetFont("Arial", "B", 16)
	pdf.Cell(0, 10, "Laporan Keuangan Platform Savora")
	pdf.Ln(12)

	// Date range info
	pdf.SetFont("Arial", "", 10)
	if startDate != "" && endDate != "" {
		pdf.Cell(0, 6, fmt.Sprintf("Periode: %s s/d %s", startDate, endDate))
	} else if startDate != "" {
		pdf.Cell(0, 6, fmt.Sprintf("Dari: %s", startDate))
	} else if endDate != "" {
		pdf.Cell(0, 6, fmt.Sprintf("Sampai: %s", endDate))
	} else {
		pdf.Cell(0, 6, "Periode: Semua Data")
	}
	pdf.Ln(8)

	// Table header
	pdf.SetFont("Arial", "B", 9)
	pdf.SetFillColor(22, 163, 74) // Primary color
	pdf.SetTextColor(255, 255, 255)

	colWidths := []float64{15, 40, 35, 25, 35, 35, 60}
	headers := []string{"ID", "Tanggal", "Tipe Sumber", "ID Sumber", "Subtotal", "Service Fee", "Deskripsi"}

	for i, header := range headers {
		pdf.CellFormat(colWidths[i], 8, header, "1", 0, "C", true, 0, "")
	}
	pdf.Ln(-1)

	// Reset text color for data
	pdf.SetTextColor(0, 0, 0)
	pdf.SetFont("Arial", "", 8)

	// Table data
	var totalServiceFee float64
	var totalAmount float64
	fill := false
	for _, rev := range revenues {
		if fill {
			pdf.SetFillColor(229, 245, 235) // Secondary color
		} else {
			pdf.SetFillColor(255, 255, 255)
		}

		pdf.CellFormat(colWidths[0], 7, fmt.Sprintf("%d", rev.ID), "1", 0, "C", fill, 0, "")
		pdf.CellFormat(colWidths[1], 7, rev.CreatedAt.Format("2006-01-02 15:04"), "1", 0, "L", fill, 0, "")
		pdf.CellFormat(colWidths[2], 7, rev.SourceType, "1", 0, "C", fill, 0, "")
		pdf.CellFormat(colWidths[3], 7, fmt.Sprintf("%d", rev.SourceID), "1", 0, "C", fill, 0, "")
		pdf.CellFormat(colWidths[4], 7, fmt.Sprintf("Rp %.0f", rev.Amount), "1", 0, "R", fill, 0, "")
		pdf.CellFormat(colWidths[5], 7, fmt.Sprintf("Rp %.0f", rev.ServiceFeeAmount), "1", 0, "R", fill, 0, "")

		// Truncate description if too long
		desc := rev.Description
		if len(desc) > 35 {
			desc = desc[:32] + "..."
		}
		pdf.CellFormat(colWidths[6], 7, desc, "1", 0, "L", fill, 0, "")
		pdf.Ln(-1)

		totalServiceFee += rev.ServiceFeeAmount
		totalAmount += rev.Amount
		fill = !fill
	}

	// Summary row
	pdf.SetFont("Arial", "B", 9)
	pdf.SetFillColor(229, 245, 235)
	pdf.CellFormat(colWidths[0]+colWidths[1]+colWidths[2]+colWidths[3], 8, "TOTAL", "1", 0, "R", true, 0, "")
	pdf.CellFormat(colWidths[4], 8, fmt.Sprintf("Rp %.0f", totalAmount), "1", 0, "R", true, 0, "")
	pdf.CellFormat(colWidths[5], 8, fmt.Sprintf("Rp %.0f", totalServiceFee), "1", 0, "R", true, 0, "")
	pdf.CellFormat(colWidths[6], 8, "", "1", 0, "L", true, 0, "")
	pdf.Ln(-1)

	// Footer
	pdf.Ln(5)
	pdf.SetFont("Arial", "I", 8)
	pdf.SetTextColor(107, 114, 128)
	pdf.Cell(0, 5, fmt.Sprintf("Dicetak pada: %s", time.Now().Format("2006-01-02 15:04:05")))

	// Generate buffer
	var buf bytes.Buffer
	err := pdf.Output(&buf)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(APIResponse{
			Success: false,
			Data:    nil,
			Error:   &ErrorInfo{Code: "INTERNAL_ERROR", Message: "Gagal generate PDF"},
		})
	}

	// Set headers untuk download
	filename := fmt.Sprintf("revenue_export_%s.pdf", time.Now().Format("20060102_150405"))
	c.Set("Content-Type", "application/pdf")
	c.Set("Content-Disposition", fmt.Sprintf("attachment; filename=%s", filename))

	return c.Send(buf.Bytes())
}
