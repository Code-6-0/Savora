# Database Migration - Status Standardization

**Tanggal**: 2026-07-26  
**Tujuan**: Standardize product status values from Indonesian to English

---

## 🎯 Why This Migration is Needed

**Problem**: 
- Backend queries for `status = "Active"` in marketplace
- Database has old records with `status = "Aktif"` (Indonesian)
- Result: Marketplace shows empty (no products found)

**Solution**:
- Standardize all status values to English
- Indonesian → English mapping

---

## 📋 SQL Migration Commands

Execute these commands in your database (MySQL/PostgreSQL):

### 1. Standardize Active Status

```sql
-- Convert "Aktif" (Indonesian) → "Active" (English)
UPDATE products 
SET status = 'Active' 
WHERE status = 'Aktif';
```

### 2. Standardize Expired Status

```sql
-- Convert "Kedaluwarsa" (Indonesian) → "Expired" (English)
UPDATE products 
SET status = 'Expired' 
WHERE status = 'Kedaluwarsa';
```

### 3. Standardize Sold Out Status

```sql
-- Convert "Habis" (Indonesian) → "Sold Out" (English)
UPDATE products 
SET status = 'Sold Out' 
WHERE status = 'Habis';
```

### 4. Keep Other Status Values

The following status values should remain unchanged:
- `Draft` - already in English
- `Limbah` - Food Trust status (keep Indonesian for waste classification)

---

## ✅ Verification Queries

### Check Status Distribution

```sql
-- See all status values and their counts
SELECT status, COUNT(*) as count 
FROM products 
GROUP BY status
ORDER BY count DESC;
```

**Expected Result After Migration**:
```
Active        | 5
Expired       | 3
Draft         | 1
Limbah        | 2
Sold Out      | 1
```

Should NOT see: `Aktif`, `Kedaluwarsa`, `Habis`

---

## 🔧 Migration Steps

1. **Connect to your database**:
   ```bash
   # MySQL
   mysql -u your_username -p your_database_name
   
   # PostgreSQL
   psql -U your_username -d your_database_name
   ```

2. **Run verification query** (before):
   ```sql
   SELECT status, COUNT(*) as count FROM products GROUP BY status;
   ```

3. **Execute migration commands** (all 3 UPDATE statements above)

4. **Run verification query** (after):
   ```sql
   SELECT status, COUNT(*) as count FROM products GROUP BY status;
   ```

5. **Restart backend**: `Ctrl+C` then `go run .`

6. **Test marketplace**: http://localhost:3000/marketplace

---

## ⚠️ Rollback (If Needed)

```sql
UPDATE products SET status = 'Aktif' WHERE status = 'Active';
UPDATE products SET status = 'Kedaluwarsa' WHERE status = 'Expired';
UPDATE products SET status = 'Habis' WHERE status = 'Sold Out';
```
