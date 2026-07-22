package services

import (
	"sort"
	"strings"
	"time"

	"github.com/savora/backend/models"
)

type KeywordSafetyResult struct {
	Badge       string             `json:"badge"` // Aman, Warning, Gawat
	TopPositive []KeywordOccurence `json:"top_positive"`
	TopNegative []KeywordOccurence `json:"top_negative"`
}

type KeywordOccurence struct {
	Keyword string `json:"keyword"`
	Count   int    `json:"count"`
}

// Kamus keyword sesuai PRD 12.7
var (
	keywordAman = []string{
		"enak", "segar", "fresh", "hangat", "bersih", "layak", "sesuai deskripsi",
		"lezat", "nikmat", "mantap", "oke", "recommended", "porsi pas", "worth it",
	}
	keywordWarning = []string{
		"kurang segar", "dingin", "keras", "agak asam", "bau kurang sedap",
		"kemasan rusak", "porsi kurang", "kurang hangat", "agak lembek",
	}
	keywordGawat = []string{
		"basi", "bau busuk", "berjamur", "berlendir", "sakit perut", "keracunan",
		"busuk", "mual", "diare", "tidak layak", "berbahaya",
	}
)

// ClassifyKeyword mengklasifikasikan keyword tunggal ke level (Aman/Warning/Gawat)
// Sesuai PRD 12.7: case-insensitive, substring match
func ClassifyKeyword(keyword string) string {
	keywordLower := strings.ToLower(strings.TrimSpace(keyword))
	
	// Check Gawat first (highest priority)
	for _, gawat := range keywordGawat {
		if strings.Contains(keywordLower, gawat) {
			return "Gawat"
		}
	}
	
	// Check Warning
	for _, warning := range keywordWarning {
		if strings.Contains(keywordLower, warning) {
			return "Warning"
		}
	}
	
	// Check Aman
	for _, aman := range keywordAman {
		if strings.Contains(keywordLower, aman) {
			return "Aman"
		}
	}
	
	// Keyword tidak dikenali - dikategorikan Unknown (tidak mempengaruhi badge)
	return "Unknown"
}

// ClassifyKeywords mengklasifikasikan array keyword dari free-text review
func ClassifyKeywords(keywords []string) []models.ReviewKeyword {
	var result []models.ReviewKeyword
	
	for _, kw := range keywords {
		level := ClassifyKeyword(kw)
		if level != "Unknown" { // Only save recognized keywords
			result = append(result, models.ReviewKeyword{
				Keyword: strings.TrimSpace(kw),
				Level:   level,
			})
		}
	}
	
	return result
}

// CalculateKeywordSafety menghitung badge safety UMKM berdasarkan akumulasi keyword dari reviews
// Sesuai PRD 12.7 - threshold badge per UMKM (rolling window 30 hari, minimal 3 review)
func CalculateKeywordSafety(reviews []models.Review) KeywordSafetyResult {
	result := KeywordSafetyResult{
		Badge:       "Aman",
		TopPositive: []KeywordOccurence{},
		TopNegative: []KeywordOccurence{},
	}

	// Filter reviews in the last 30 days
	thirtyDaysAgo := time.Now().AddDate(0, 0, -30)
	var recentReviews []models.Review
	for _, r := range reviews {
		if r.CreatedAt.After(thirtyDaysAgo) || r.CreatedAt.IsZero() {
			recentReviews = append(recentReviews, r)
		}
	}

	// Minimal 3 review agar badge tampil
	if len(recentReviews) < 3 {
		result.Badge = "Belum Cukup Data"
		return result
	}

	// Aggregate keywords
	positiveCounts := make(map[string]int)
	negativeCounts := make(map[string]int)

	for _, r := range recentReviews {
		for _, kw := range r.ReviewKeywords {
			if kw.Level == "Gawat" {
				negativeCounts[kw.Keyword]++
			} else if kw.Level == "Warning" {
				negativeCounts[kw.Keyword]++
			} else if kw.Level == "Aman" {
				positiveCounts[kw.Keyword]++
			}
		}
	}

	// Count Gawat keywords
	totalGawatCount := 0
	uniqueGawatCustomers := make(map[uint]bool)
	for _, r := range recentReviews {
		hasGawat := false
		for _, kw := range r.ReviewKeywords {
			if kw.Level == "Gawat" {
				totalGawatCount++
				hasGawat = true
			}
		}
		if hasGawat {
			uniqueGawatCustomers[r.ReviewerID] = true
		}
	}

	// Count Warning keywords
	totalWarningCount := 0
	uniqueWarningCustomers := make(map[uint]bool)
	for _, r := range recentReviews {
		hasWarning := false
		for _, kw := range r.ReviewKeywords {
			if kw.Level == "Warning" {
				totalWarningCount++
				hasWarning = true
			}
		}
		if hasWarning {
			uniqueWarningCustomers[r.ReviewerID] = true
		}
	}

	// Determine badge sesuai PRD 12.7:
	// Gawat: >= 3 keyword Gawat dari >= 2 customer berbeda
	// Warning: >= 3 keyword Warning, atau 1-2 keyword Gawat
	// Aman: Selain kondisi di atas
	if totalGawatCount >= 3 && len(uniqueGawatCustomers) >= 2 {
		result.Badge = "Gawat"
	} else if totalWarningCount >= 3 || (totalGawatCount >= 1 && totalGawatCount <= 2) {
		result.Badge = "Warning"
	} else {
		result.Badge = "Aman"
	}

	// Populate Top Positive
	for k, v := range positiveCounts {
		result.TopPositive = append(result.TopPositive, KeywordOccurence{Keyword: k, Count: v})
	}
	sort.SliceStable(result.TopPositive, func(i, j int) bool {
		return result.TopPositive[i].Count > result.TopPositive[j].Count
	})
	if len(result.TopPositive) > 5 {
		result.TopPositive = result.TopPositive[:5]
	}

	// Populate Top Negative
	for k, v := range negativeCounts {
		result.TopNegative = append(result.TopNegative, KeywordOccurence{Keyword: k, Count: v})
	}
	sort.SliceStable(result.TopNegative, func(i, j int) bool {
		return result.TopNegative[i].Count > result.TopNegative[j].Count
	})
	if len(result.TopNegative) > 5 {
		result.TopNegative = result.TopNegative[:5]
	}

	return result
}
