package services

import (
	"sort"
	"time"

	"github.com/savora/backend/models"
)

type KeywordSafetyResult struct {
	Badge       string               `json:"badge"` // Aman, Warning, Gawat
	TopPositive []KeywordOccurence   `json:"top_positive"`
	TopNegative []KeywordOccurence   `json:"top_negative"`
}

type KeywordOccurence struct {
	Keyword string `json:"keyword"`
	Count   int    `json:"count"`
}

func CalculateKeywordSafety(reviews []models.Review) KeywordSafetyResult {
	// PRD Rules (REVISI #16):
	// Threshold badge per UMKM (rolling window 30 hari, minimal 3 review agar badge tampil):
	// Gawat: >= 3 keyword Gawat dari >= 2 customer berbeda.
	// Warning: >= 3 keyword Warning dari >= 2 customer berbeda.
	// Aman: Selain kondisi di atas.

	result := KeywordSafetyResult{
		Badge:       "Aman",
		TopPositive: []KeywordOccurence{},
		TopNegative: []KeywordOccurence{},
	}

	// Filter reviews in the last 30 days
	thirtyDaysAgo := time.Now().AddDate(0, 0, -30)
	var recentReviews []models.Review
	for _, r := range reviews {
		if r.CreatedAt.After(thirtyDaysAgo) || r.CreatedAt.IsZero() { // IsZero for seeded mock data
			recentReviews = append(recentReviews, r)
		}
	}

	if len(recentReviews) < 3 {
		result.Badge = "Belum Cukup Data"
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

	isGawat := false
	totalGawatCount := 0
	uniqueGawatCustomers := make(map[string]bool)
	for _, r := range recentReviews {
		for _, kw := range r.ReviewKeywords {
			if kw.Level == "Gawat" {
				totalGawatCount++
				uniqueGawatCustomers[r.CustomerName] = true
			}
		}
	}
	if totalGawatCount >= 3 && len(uniqueGawatCustomers) >= 2 {
		isGawat = true
	}

	totalWarningCount := 0
	uniqueWarningCustomers := make(map[string]bool)
	for _, r := range recentReviews {
		for _, kw := range r.ReviewKeywords {
			if kw.Level == "Warning" {
				totalWarningCount++
				uniqueWarningCustomers[r.CustomerName] = true
			}
		}
	}
	isWarning := false
	if totalWarningCount >= 3 && len(uniqueWarningCustomers) >= 2 {
		isWarning = true
	}

	if result.Badge != "Belum Cukup Data" {
		if isGawat {
			result.Badge = "Gawat"
		} else if isWarning {
			result.Badge = "Warning"
		} else {
			result.Badge = "Aman"
		}
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
