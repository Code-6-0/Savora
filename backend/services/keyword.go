package services

import (
	"github.com/savora/backend/models"
)

// Stub file - keyword analysis implementation by Ridwan
// TODO: Update when review model integration is complete

type KeywordSafetyResult struct {
	SafetyLevel string `json:"safety_level"`
	TotalAman   int    `json:"total_aman"`
	TotalWarning int   `json:"total_warning"`
	TotalGawat  int    `json:"total_gawat"`
}

func AnalyzeKeywordSafety(reviews []models.Review) KeywordSafetyResult {
	return KeywordSafetyResult{
		SafetyLevel: "AMAN",
	}
}

func ExtractTopKeywords(reviews []models.Review, level string, limit int) []string {
	return []string{}
}
