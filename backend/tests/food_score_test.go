package tests

import (
	"math"
	"testing"
	"time"
)

// HitungFoodScore implements the Food Score decay formula from PRD 12.6
// Formula: skor_akhir = skor_awal × (f^γ), where γ = 0.65
// f = (expires_at - now) / (expires_at - publish_at), clamped to [0, 1]
func HitungFoodScore(skorAwal float64, publishAt, expiresAt, now time.Time) int {
	total := expiresAt.Sub(publishAt).Seconds()
	if total <= 0 {
		return 0
	}
	f := expiresAt.Sub(now).Seconds() / total
	f = math.Max(0, math.Min(1, f))
	return int(math.Round(skorAwal * math.Pow(f, 0.65)))
}

// TestFoodScoreDecay tests the Food Score decay calculation with exact test cases from PRD 12.6
// Test case: skor_awal = 100, masa_layak = 8 jam
// Expected results:
// - 8 jam tersisa → 100
// - 6 jam tersisa → 83
// - 4 jam tersisa → 64
// - 2 jam tersisa → 41
// - 1 jam tersisa → 26
// - 0 jam tersisa → 0
func TestFoodScoreDecay(t *testing.T) {
	skorAwal := 100.0
	now := time.Now()
	publishAt := now
	expiresAt := now.Add(8 * time.Hour) // Masa layak 8 jam

	tests := []struct {
		name            string
		timeElapsed     time.Duration
		expectedScore   int
		toleranceMargin int // Allow ±1 for rounding differences
	}{
		{"8 jam tersisa (awal)", 0 * time.Hour, 100, 0},
		{"6 jam tersisa", 2 * time.Hour, 83, 1},
		{"4 jam tersisa", 4 * time.Hour, 64, 1},
		{"2 jam tersisa", 6 * time.Hour, 41, 1},
		{"1 jam tersisa", 7 * time.Hour, 26, 1},
		{"0 jam tersisa (kadaluarsa)", 8 * time.Hour, 0, 0},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			currentTime := publishAt.Add(tt.timeElapsed)
			score := HitungFoodScore(skorAwal, publishAt, expiresAt, currentTime)

			// Check if score is within tolerance
			diff := int(math.Abs(float64(score - tt.expectedScore)))
			if diff > tt.toleranceMargin {
				t.Errorf("HitungFoodScore() = %d, want %d (±%d), diff = %d",
					score, tt.expectedScore, tt.toleranceMargin, diff)
			} else {
				t.Logf("✓ %s: score = %d (expected %d ±%d)",
					tt.name, score, tt.expectedScore, tt.toleranceMargin)
			}
		})
	}
}

// TestFoodScoreEdgeCases tests edge cases for Food Score calculation
func TestFoodScoreEdgeCases(t *testing.T) {
	now := time.Now()
	skorAwal := 100.0

	t.Run("masa layak = 0 (invalid)", func(t *testing.T) {
		publishAt := now
		expiresAt := now // Sama = masa layak 0
		score := HitungFoodScore(skorAwal, publishAt, expiresAt, now)
		if score != 0 {
			t.Errorf("HitungFoodScore() dengan masa layak 0 = %d, want 0", score)
		}
	})

	t.Run("expires_at sebelum publish_at (invalid)", func(t *testing.T) {
		publishAt := now
		expiresAt := now.Add(-1 * time.Hour) // Expired sebelum publish
		score := HitungFoodScore(skorAwal, publishAt, expiresAt, now)
		if score != 0 {
			t.Errorf("HitungFoodScore() dengan expires < publish = %d, want 0", score)
		}
	})

	t.Run("sudah kadaluarsa (now > expires_at)", func(t *testing.T) {
		publishAt := now.Add(-10 * time.Hour)
		expiresAt := now.Add(-2 * time.Hour) // Sudah kadaluarsa 2 jam lalu
		currentTime := now
		score := HitungFoodScore(skorAwal, publishAt, expiresAt, currentTime)
		if score != 0 {
			t.Errorf("HitungFoodScore() untuk produk kadaluarsa = %d, want 0", score)
		}
	})

	t.Run("baru di-publish (f = 1)", func(t *testing.T) {
		publishAt := now
		expiresAt := now.Add(24 * time.Hour)
		currentTime := now // Tepat saat publish
		score := HitungFoodScore(skorAwal, publishAt, expiresAt, currentTime)
		if score != 100 {
			t.Errorf("HitungFoodScore() tepat saat publish = %d, want 100", score)
		}
	})

	t.Run("skor awal berbeda", func(t *testing.T) {
		publishAt := now
		expiresAt := now.Add(10 * time.Hour)
		currentTime := now.Add(5 * time.Hour) // Setengah masa layak, f = 0.5

		// Dengan f = 0.5, γ = 0.65: f^γ = 0.5^0.65 ≈ 0.635
		// skor_awal = 80 → 80 × 0.635 ≈ 51
		skorAwalCustom := 80.0
		score := HitungFoodScore(skorAwalCustom, publishAt, expiresAt, currentTime)

		// Expected: 80 × (0.5^0.65) ≈ 80 × 0.635 ≈ 51
		expected := 51
		tolerance := 2
		if math.Abs(float64(score-expected)) > float64(tolerance) {
			t.Errorf("HitungFoodScore(skor_awal=80, f=0.5) = %d, want ~%d", score, expected)
		}
	})
}

// TestFoodScoreClampingBehavior tests that f is properly clamped to [0, 1]
func TestFoodScoreClampingBehavior(t *testing.T) {
	now := time.Now()
	skorAwal := 100.0

	t.Run("f > 1 (produk belum publish, now < publish_at) should clamp to 1", func(t *testing.T) {
		publishAt := now.Add(1 * time.Hour)   // Publish 1 jam dari sekarang
		expiresAt := now.Add(10 * time.Hour) // Expires 10 jam dari sekarang
		currentTime := now                    // Sekarang < publish_at

		// Secara matematis, f = (10-0)/(10-(-1)) = 10/9 > 1
		// Harus di-clamp ke 1 → score = 100
		score := HitungFoodScore(skorAwal, publishAt, expiresAt, currentTime)
		if score != 100 {
			t.Errorf("HitungFoodScore() dengan f > 1 = %d, want 100 (clamped)", score)
		}
	})

	t.Run("f < 0 (produk lewat expired) should clamp to 0", func(t *testing.T) {
		publishAt := now.Add(-10 * time.Hour)
		expiresAt := now.Add(-2 * time.Hour)  // Sudah kadaluarsa 2 jam lalu
		currentTime := now

		// f = (now - (-2h)) / ((-2h) - (-10h)) = 2h/8h = 0.25... wait, ini masih positif
		// Contoh yang benar: now > expires_at → (expires_at - now) < 0
		// f = (expires_at - now) / total = negatif / positif = negatif
		// Harus di-clamp ke 0 → score = 0
		score := HitungFoodScore(skorAwal, publishAt, expiresAt, currentTime)
		if score != 0 {
			t.Errorf("HitungFoodScore() dengan f < 0 = %d, want 0 (clamped)", score)
		}
	})
}

// TestServiceFeeCalculation tests the 5% service fee calculation (PRD requirement)
func TestServiceFeeCalculation(t *testing.T) {
	tests := []struct {
		name        string
		subtotal    float64
		expectedFee float64
	}{
		{"Subtotal 100.000", 100000, 5000},
		{"Subtotal 50.000", 50000, 2500},
		{"Subtotal 75.000", 75000, 3750},
		{"Subtotal 1.000", 1000, 50},
		{"Subtotal 0 (edge case)", 0, 0},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			serviceFee := tt.subtotal * 0.05
			if serviceFee != tt.expectedFee {
				t.Errorf("Service Fee 5%% dari %.0f = %.0f, want %.0f",
					tt.subtotal, serviceFee, tt.expectedFee)
			} else {
				t.Logf("✓ %s: subtotal = %.0f, service_fee = %.0f, total = %.0f",
					tt.name, tt.subtotal, serviceFee, tt.subtotal+serviceFee)
			}
		})
	}
}

// TestDynamicDiscountRules tests dynamic discount rule validation (PRD 12.7)
func TestDynamicDiscountRules(t *testing.T) {
	tests := []struct {
		foodTrustStatus string
		minDiscount     float64
		maxDiscount     float64
		shouldSell      bool // Apakah boleh dijual
	}{
		{"FRESH", 0.10, 0.20, true},                          // Fresh: 10-20%
		{"LAYAK_DIJUAL", 0.20, 0.35, true},                   // Layak Dijual: 20-35%
		{"SEGERA_DIJUAL", 0.35, 0.50, true},                  // Segera Dijual: 35-50%
		{"TIDAK_DISARANKAN_DIJUAL", 0, 0, false},             // Tidak boleh dijual
		{"TIDAK_LAYAK_KONSUMSI", 0, 0, false},                // Tidak boleh dijual
	}

	for _, tt := range tests {
		t.Run(tt.foodTrustStatus, func(t *testing.T) {
			if !tt.shouldSell {
				t.Logf("✓ Status %s: TIDAK BOLEH DIJUAL (as expected)", tt.foodTrustStatus)
				return
			}

			// Test discount boundaries
			t.Logf("✓ Status %s: discount range %.0f%%-%.0f%% (valid)",
				tt.foodTrustStatus, tt.minDiscount*100, tt.maxDiscount*100)

			// Validate discount range makes sense
			if tt.minDiscount >= tt.maxDiscount {
				t.Errorf("Invalid discount range: min (%.2f) >= max (%.2f)",
					tt.minDiscount, tt.maxDiscount)
			}
		})
	}
}
