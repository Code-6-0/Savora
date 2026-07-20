# Script PowerShell untuk kompilasi dokumen LaTeX
# File: compile-latex.ps1
# Deskripsi: Mengkompilasi bukped.tex secara otomatis

# Set nama file (tanpa ekstensi)
$TexFile = "bukped"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Kompilasi LaTeX Document" -ForegroundColor Cyan
Write-Host "  File: $TexFile.tex" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Kompilasi pertama
Write-Host "[1/4] Menjalankan pdflatex (kompilasi pertama)..." -ForegroundColor Yellow
pdflatex -interaction=nonstopmode "$TexFile.tex" | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "      OK Berhasil" -ForegroundColor Green
}
else {
    Write-Host "      ! Selesai dengan warning" -ForegroundColor Yellow
}

# Menjalankan Biber
Write-Host "[2/4] Menjalankan biber..." -ForegroundColor Yellow
biber "$TexFile" | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "      OK Berhasil" -ForegroundColor Green
}
else {
    Write-Host "      ! Selesai dengan warning" -ForegroundColor Yellow
}

# Kompilasi kedua
Write-Host "[3/4] Menjalankan pdflatex (kompilasi kedua)..." -ForegroundColor Yellow
pdflatex -interaction=nonstopmode "$TexFile.tex" | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "      OK Berhasil" -ForegroundColor Green
}
else {
    Write-Host "      ! Selesai dengan warning" -ForegroundColor Yellow
}

# Kompilasi ketiga (final)
Write-Host "[4/4] Menjalankan pdflatex (kompilasi ketiga)..." -ForegroundColor Yellow
pdflatex -interaction=nonstopmode "$TexFile.tex" | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "      OK Berhasil" -ForegroundColor Green
}
else {
    Write-Host "      ! Selesai dengan warning" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan

# Cek apakah PDF berhasil dibuat
if (Test-Path "$TexFile.pdf") {
    $pdfInfo = Get-Item "$TexFile.pdf"
    Write-Host "OK Kompilasi selesai!" -ForegroundColor Green
    Write-Host "  File: $($pdfInfo.Name)" -ForegroundColor White
    Write-Host "  Ukuran: $([math]::Round($pdfInfo.Length/1KB, 2)) KB" -ForegroundColor White
    Write-Host "  Terakhir diupdate: $($pdfInfo.LastWriteTime)" -ForegroundColor White
    
    # Bersihkan file auxiliary (opsional)
    Write-Host ""
    $cleanup = Read-Host "Hapus file auxiliary? y/n"
    if ($cleanup -eq 'y' -or $cleanup -eq 'Y') {
        Remove-Item "$TexFile.aux" -ErrorAction SilentlyContinue
        Remove-Item "$TexFile.log" -ErrorAction SilentlyContinue
        Remove-Item "$TexFile.out" -ErrorAction SilentlyContinue
        Remove-Item "$TexFile.toc" -ErrorAction SilentlyContinue
        Remove-Item "$TexFile.lot" -ErrorAction SilentlyContinue
        Remove-Item "$TexFile.lof" -ErrorAction SilentlyContinue
        Remove-Item "$TexFile.equ" -ErrorAction SilentlyContinue
        Remove-Item "$TexFile.bbl" -ErrorAction SilentlyContinue
        Remove-Item "$TexFile.blg" -ErrorAction SilentlyContinue
        Remove-Item "$TexFile.bcf" -ErrorAction SilentlyContinue
        Remove-Item "$TexFile.run.xml" -ErrorAction SilentlyContinue
        Remove-Item "$TexFile-blx.bib" -ErrorAction SilentlyContinue
        Write-Host "OK File auxiliary telah dihapus" -ForegroundColor Green
    }
}
else {
    Write-Host "X Kompilasi gagal! PDF tidak ditemukan." -ForegroundColor Red
    Write-Host "  Cek file $TexFile.log untuk detail error." -ForegroundColor Yellow
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
