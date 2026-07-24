package main

import (
	"fmt"
	"os"

	"github.com/joho/godotenv"
)

func main() {
	fmt.Println("=== Test Verifikasi .env.fixed ===\n")

	// Load .env.fixed
	err := godotenv.Load(".env.fixed")
	if err != nil {
		fmt.Printf("❌ Error loading .env.fixed: %v\n", err)
		os.Exit(1)
	}
	fmt.Println("✅ File .env.fixed berhasil dimuat\n")

	// Check required variables
	dbHost := os.Getenv("DB_HOST")
	dbPort := os.Getenv("DB_PORT")
	dbUser := os.Getenv("DB_USER")
	dbPassword := os.Getenv("DB_PASSWORD")
	dbName := os.Getenv("DB_NAME")

	fmt.Println("Status variabel DB_*:")
	fmt.Printf("  DB_HOST: %s (length: %d)\n", boolEmoji(dbHost != ""), len(dbHost))
	fmt.Printf("  DB_PORT: %s (length: %d)\n", boolEmoji(dbPort != ""), len(dbPort))
	fmt.Printf("  DB_USER: %s (length: %d)\n", boolEmoji(dbUser != ""), len(dbUser))
	fmt.Printf("  DB_PASSWORD: %s (length: %d) [VALUE MASKED]\n", boolEmoji(dbPassword != ""), len(dbPassword))
	fmt.Printf("  DB_NAME: %s (length: %d)\n", boolEmoji(dbName != ""), len(dbName))

	// Check if all non-empty
	allPresent := dbHost != "" && dbPort != "" && dbUser != "" && dbPassword != "" && dbName != ""
	fmt.Printf("\n%s Semua variabel DB_* terisi: %v\n", boolEmoji(allPresent), allPresent)

	if allPresent {
		fmt.Println("\n✅ .env.fixed VALID — siap digunakan untuk replace .env")
	} else {
		fmt.Println("\n❌ .env.fixed INVALID — ada variabel yang kosong")
		os.Exit(1)
	}
}

func boolEmoji(b bool) string {
	if b {
		return "✅"
	}
	return "❌"
}
