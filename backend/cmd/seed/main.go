package main

import (
	"log"
	"time"

	"github.com/joho/godotenv"
	"github.com/savora/backend/database"
	"github.com/savora/backend/models"
)

func main() {
	log.Println("🌱 Starting seed data...")

	// Load .env file
	if err := godotenv.Load("../../.env"); err != nil {
		log.Println("Warning: .env file not found, relying on environment variables")
	}

	// Connect to database
	database.ConnectDB()

	// Run migrations first

	// Clear existing data (idempotent seed)
	log.Println("Clearing existing data...")
	database.DB.Exec("DELETE FROM ad_metrics")
	database.DB.Exec("DELETE FROM advertisements")
	database.DB.Exec("DELETE FROM platform_revenue")
	database.DB.Exec("DELETE FROM orders")
	database.DB.Exec("DELETE FROM products")
	database.DB.Exec("DELETE FROM umkm_profiles")
	database.DB.Exec("DELETE FROM customer_profiles")
	database.DB.Exec("DELETE FROM users")

	// Reset sequences (PostgreSQL)
	database.DB.Exec("ALTER SEQUENCE users_id_seq RESTART WITH 1")
	database.DB.Exec("ALTER SEQUENCE customer_profiles_id_seq RESTART WITH 1")
	database.DB.Exec("ALTER SEQUENCE umkm_profiles_id_seq RESTART WITH 1")
	database.DB.Exec("ALTER SEQUENCE products_id_seq RESTART WITH 1")
	database.DB.Exec("ALTER SEQUENCE orders_id_seq RESTART WITH 1")
	database.DB.Exec("ALTER SEQUENCE advertisements_id_seq RESTART WITH 1")
	database.DB.Exec("ALTER SEQUENCE ad_metrics_id_seq RESTART WITH 1")
	database.DB.Exec("ALTER SEQUENCE platform_revenue_id_seq RESTART WITH 1")

	// Create users
	log.Println("Creating users...")

	// 1. Admin
	adminUser := models.User{
		Name:   "Admin Savora",
		Email:  "admin@savora.com",
		Role:   models.RoleAdmin,
		Status: models.StatusActive,
	}
	adminUser.SetPassword("admin123")
	database.DB.Create(&adminUser)
	log.Printf("✓ Admin created (ID: %d, email: %s, password: admin123)", adminUser.ID, adminUser.Email)

	// 2. Customer
	customerUser := models.User{
		Name:   "Budi Santoso",
		Email:  "customer@savora.com",
		Role:   models.RoleCustomer,
		Status: models.StatusActive,
	}
	customerUser.SetPassword("customer123")
	database.DB.Create(&customerUser)

	customerProfile := models.CustomerProfile{
		UserID:  customerUser.ID,
		Phone:   "081234567890",
		Address: "Jl. Sudirman No. 123, Jakarta Pusat",
		Avatar:  "",
	}
	database.DB.Create(&customerProfile)
	log.Printf("✓ Customer created (ID: %d, email: %s, password: customer123)", customerUser.ID, customerUser.Email)

	// 3. UMKM
	umkmUser := models.User{
		Name:   "Bu Lestari",
		Email:  "umkm@savora.com",
		Role:   models.RoleUMKM,
		Status: models.StatusActive,
	}
	umkmUser.SetPassword("umkm123")
	database.DB.Create(&umkmUser)

	umkmProfile := models.UMKMProfile{
		UserID:             umkmUser.ID,
		BusinessName:       "Warung Bu Lestari",
		Address:            "Jl. Mangga Dua No. 45, Jakarta Utara",
		GeoLocation:        "-6.1354, 106.8360",
		VerificationStatus: "APPROVED",
		Rating:             4.5,
	}
	database.DB.Create(&umkmProfile)
	log.Printf("✓ UMKM created (ID: %d, email: %s, password: umkm123)", umkmUser.ID, umkmUser.Email)

	// 4. Mitra Donasi
	mitraUser := models.User{
		Name:   "Yayasan Berbagi",
		Email:  "mitra@savora.com",
		Role:   models.RoleMitraDonasi,
		Status: models.StatusPending,
	}
	mitraUser.SetPassword("mitra123")
	database.DB.Create(&mitraUser)
	log.Printf("✓ Mitra Donasi created (ID: %d, email: %s, password: mitra123)", mitraUser.ID, mitraUser.Email)

	// Create products
	log.Println("Creating products...")

	products := []models.Product{
		{
			UmkmID:           umkmProfile.ID,
			Name:             "Nasi Goreng Spesial",
			Category:         "Makanan Berat",
			Description:      "Nasi goreng dengan telur dan ayam suwir",
			PhotoURL:         "https://via.placeholder.com/300x200?text=Nasi+Goreng",
			OriginalPrice:    25000,
			RescuePrice:      15000,
			Stock:            5,
			WeightPerPortion: 350,
			PickupAddress:    "Jl. Mangga Dua No. 45, Jakarta Utara",
			FoodTrustStatus:  "Layak Dijual",
			ExpiresAt:        timePtr(time.Now().Add(4 * time.Hour)),
			Status:           "Active",
		},
		{
			UmkmID:           umkmProfile.ID,
			Name:             "Ayam Geprek",
			Category:         "Makanan Berat",
			Description:      "Ayam goreng crispy dengan sambal geprek level 3",
			PhotoURL:         "https://via.placeholder.com/300x200?text=Ayam+Geprek",
			OriginalPrice:    20000,
			RescuePrice:      12000,
			Stock:            3,
			WeightPerPortion: 300,
			PickupAddress:    "Jl. Mangga Dua No. 45, Jakarta Utara",
			FoodTrustStatus:  "Fresh",
			ExpiresAt:        timePtr(time.Now().Add(6 * time.Hour)),
			Status:           "Active",
		},
		{
			UmkmID:           umkmProfile.ID,
			Name:             "Roti Sobek Coklat",
			Category:         "Kue & Pastry",
			Description:      "Roti sobek lembut isi coklat",
			PhotoURL:         "https://via.placeholder.com/300x200?text=Roti+Sobek",
			OriginalPrice:    15000,
			RescuePrice:      8000,
			Stock:            8,
			WeightPerPortion: 200,
			PickupAddress:    "Jl. Mangga Dua No. 45, Jakarta Utara",
			FoodTrustStatus:  "Layak Dijual",
			ExpiresAt:        timePtr(time.Now().Add(2 * time.Hour)),
			Status:           "Active",
		},
		{
			UmkmID:           umkmProfile.ID,
			Name:             "Soto Ayam",
			Category:         "Makanan Berat",
			Description:      "Soto ayam dengan kuah gurih dan bumbu khas",
			PhotoURL:         "https://via.placeholder.com/300x200?text=Soto+Ayam",
			OriginalPrice:    18000,
			RescuePrice:      10000,
			Stock:            0,
			WeightPerPortion: 400,
			PickupAddress:    "Jl. Mangga Dua No. 45, Jakarta Utara",
			FoodTrustStatus:  "Fresh",
			ExpiresAt:        timePtr(time.Now().Add(3 * time.Hour)),
			Status:           "Sold Out",
		},
	}

	for i, p := range products {
		database.DB.Create(&p)
		products[i] = p
		log.Printf("✓ Product created: %s (ID: %d, Stock: %d, Status: %s)", p.Name, p.ID, p.Stock, p.Status)
	}

	// Create orders
	log.Println("Creating orders...")

	orders := []models.Order{
		{
			UmkmID:       umkmProfile.ID,
			CustomerName: "Budi Santoso",
			TotalAmount:  15000,
			Status:       "Selesai",
			PickupTime:   time.Now().Add(-24 * time.Hour).Format("2006-01-02 15:04"),
		},
		{
			UmkmID:       umkmProfile.ID,
			CustomerName: "Ani Wijaya",
			TotalAmount:  27000,
			Status:       "Selesai",
			PickupTime:   time.Now().Add(-48 * time.Hour).Format("2006-01-02 15:04"),
		},
		{
			UmkmID:       umkmProfile.ID,
			CustomerName: "Citra Dewi",
			TotalAmount:  12000,
			Status:       "Siap Diambil",
			PickupTime:   time.Now().Add(2 * time.Hour).Format("2006-01-02 15:04"),
		},
		{
			UmkmID:       umkmProfile.ID,
			CustomerName: "Dedi Kurniawan",
			TotalAmount:  20000,
			Status:       "Diproses",
			PickupTime:   time.Now().Add(3 * time.Hour).Format("2006-01-02 15:04"),
		},
		{
			UmkmID:       umkmProfile.ID,
			CustomerName: "Eka Putri",
			TotalAmount:  15000,
			Status:       "Menunggu",
			PickupTime:   time.Now().Add(4 * time.Hour).Format("2006-01-02 15:04"),
		},
		{
			UmkmID:       umkmProfile.ID,
			CustomerName: "Fajar Ramadhan",
			TotalAmount:  18000,
			Status:       "Dibatalkan",
			PickupTime:   time.Now().Add(-12 * time.Hour).Format("2006-01-02 15:04"),
		},
	}

	for i, o := range orders {
		database.DB.Create(&o)
		orders[i] = o
		log.Printf("✓ Order created: ID %d, Customer: %s, Status: %s, Amount: Rp%.0f", o.ID, o.CustomerName, o.Status, o.TotalAmount)
	}

	// Create advertisements
	log.Println("Creating advertisements...")

	// Create an external advertiser user
	externalUser := models.User{
		Name:   "PT Maju Bersama",
		Email:  "external@example.com",
		Role:   models.RoleCustomer, // External advertiser uses customer role
		Status: models.StatusActive,
	}
	externalUser.SetPassword("external123")
	database.DB.Create(&externalUser)
	log.Printf("✓ External advertiser created (ID: %d)", externalUser.ID)

	now := time.Now()
	yesterday := now.AddDate(0, 0, -1)
	twoDaysAgo := now.AddDate(0, 0, -2)

	advertisements := []models.Advertisement{
		{
			AdvertiserID:   umkmUser.ID,
			AdvertiserType: models.AdvertiserTypeUMKM,
			Title:          "Promo Nasi Goreng Spesial - Diskon 40%",
			ImageURL:       "https://via.placeholder.com/800x400?text=Promo+Nasi+Goreng",
			TargetURL:      "https://savora.com/warung-bu-lestari",
			DurationDays:   7,
			Price:          100000,
			ServiceFee:     5000, // 5% dari 100000
			Status:         models.AdStatusPending,
		},
		{
			AdvertiserID:   umkmUser.ID,
			AdvertiserType: models.AdvertiserTypeUMKM,
			Title:          "Paket Hemat Ayam Geprek + Minuman",
			ImageURL:       "https://via.placeholder.com/800x400?text=Paket+Hemat",
			TargetURL:      "https://savora.com/warung-bu-lestari",
			DurationDays:   14,
			Price:          200000,
			ServiceFee:     10000,
			Status:         models.AdStatusPending,
		},
		{
			AdvertiserID:   externalUser.ID,
			AdvertiserType: models.AdvertiserTypeExternal,
			Title:          "Download Aplikasi FoodDelivery - Gratis Ongkir",
			ImageURL:       "https://via.placeholder.com/800x400?text=FoodDelivery+App",
			TargetURL:      "https://example.com/fooddelivery",
			DurationDays:   30,
			Price:          500000,
			ServiceFee:     25000,
			Status:         models.AdStatusPending,
		},
		{
			AdvertiserID:   externalUser.ID,
			AdvertiserType: models.AdvertiserTypeExternal,
			Title:          "Peralatan Dapur Berkualitas - Sale 50%",
			ImageURL:       "https://via.placeholder.com/800x400?text=Kitchen+Sale",
			TargetURL:      "https://example.com/kitchen-store",
			DurationDays:   7,
			Price:          150000,
			ServiceFee:     7500,
			Status:         models.AdStatusApproved, // APPROVED, akan menjadi ACTIVE saat query pertama (starts_at sudah lewat)
			ApprovedBy:     &adminUser.ID,
			ApprovedAt:     &yesterday,
			StartsAt:       &yesterday,
			ExpiresAt:      timePtr(yesterday.AddDate(0, 0, 7)),
		},
		{
			AdvertiserID:   umkmUser.ID,
			AdvertiserType: models.AdvertiserTypeUMKM,
			Title:          "Kue Basah Tradisional - Hanya 5rb",
			ImageURL:       "https://via.placeholder.com/800x400?text=Kue+Basah",
			TargetURL:      "https://savora.com/warung-bu-lestari",
			DurationDays:   3,
			Price:          50000,
			ServiceFee:     2500,
			Status:         models.AdStatusRejected,
			ApprovedBy:     &adminUser.ID,
			ApprovedAt:     &twoDaysAgo,
		},
		{
			AdvertiserID:   externalUser.ID,
			AdvertiserType: models.AdvertiserTypeExternal,
			Title:          "Belajar Masak Online - Kursus Gratis",
			ImageURL:       "https://via.placeholder.com/800x400?text=Cooking+Course",
			TargetURL:      "https://example.com/cooking-course",
			DurationDays:   7,
			Price:          300000,
			ServiceFee:     15000,
			Status:         models.AdStatusExpired,
			ApprovedBy:     &adminUser.ID,
			ApprovedAt:     timePtr(now.AddDate(0, 0, -10)),
			StartsAt:       timePtr(now.AddDate(0, 0, -10)),
			ExpiresAt:      timePtr(now.AddDate(0, 0, -3)),
		},
	}

	for i, ad := range advertisements {
		database.DB.Create(&ad)
		advertisements[i] = ad
		log.Printf("✓ Advertisement created: %s (ID: %d, Type: %s, Status: %s, Price: Rp%.0f)",
			ad.Title, ad.ID, ad.AdvertiserType, ad.Status, ad.Price)

		// Catat platform_revenue untuk iklan yang sudah APPROVED (status APPROVED, ACTIVE, atau EXPIRED)
		if ad.Status == models.AdStatusApproved || ad.Status == models.AdStatusActive || ad.Status == models.AdStatusExpired {
			revenue := models.PlatformRevenue{
				SourceType:       models.RevenueSourceAdvertisement,
				SourceID:         ad.ID,
				Amount:           ad.Price,
				ServiceFeeAmount: ad.ServiceFee,
				Description:      "Service fee iklan: " + ad.Title,
			}
			database.DB.Create(&revenue)
			log.Printf("  ✓ Platform revenue recorded: Rp%.0f (fee: Rp%.0f)", revenue.Amount, revenue.ServiceFeeAmount)
		}
	}

	// Summary
	log.Println("\n✅ Seed completed successfully!")
	log.Println("\n📊 Summary:")
	log.Printf("   Users: 5 (1 Admin, 1 Customer, 1 UMKM, 1 Mitra Donasi, 1 External Advertiser)")
	log.Printf("   UMKM Profiles: 1 (APPROVED)")
	log.Printf("   Products: %d (Active: 3, Sold Out: 1)", len(products))
	log.Printf("   Orders: %d (Selesai: 2, Siap Diambil: 1, Diproses: 1, Menunggu: 1, Dibatalkan: 1)", len(orders))
	log.Printf("   Advertisements: 6 (Pending: 3, Approved: 1, Rejected: 1, Expired: 1)")
	log.Printf("   Total Transaction Value (Selesai): Rp%.0f", 15000.0+27000.0)
	log.Println("   Platform Revenue (Ads): akan dicatat otomatis saat iklan Approved menjadi Active")

	log.Println("\n🔑 Login Credentials:")
	log.Println("   Admin:    admin@savora.com / admin123")
	log.Println("   Customer: customer@savora.com / customer123")
	log.Println("   UMKM:     umkm@savora.com / umkm123")
	log.Println("   Mitra:    mitra@savora.com / mitra123")
}

func timePtr(t time.Time) *time.Time {
	return &t
}
