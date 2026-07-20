# Latex Template Laporan
Untuk memakai template ini secara mudah gunakan aplikasi Antigravity dengan open folder(jangan lupa install extenstion vscode-pdf), kemudian

Install latex:
1. Install R dahulu
2. install TinyTex
    ```R
    install.packages('tinytex')
    tinytex::install_tinytex()
    # to uninstall TinyTeX, run tinytex::uninstall_tinytex() 
    # Cek instalasi
    tinytex::tinytex_root()
    tinytex::tlmgr("--version")
    ```
3. Install Package menggunakan tlmgr
    ```
    tlmgr install <package_name>
    ```
4. Install git scm dan koneksikan ke repository github
5. Install Antigravity dan ekstensi vscode-pdf

Package yang diperlukan:
```bash
tlmgr install inputenc fontenc mathptmx courier helvet amsmath amsfonts psnfss babel geometry setspace titlesec graphicx hyperref booktabs array caption enumitem parskip fancyhdr tocloft tabularx longtable ragged2e csquotes biblatex biber logreq xstring pifont multirow
```

Atau install satu per satu:
```bash
tlmgr install inputenc
tlmgr install fontenc
tlmgr install mathptmx
tlmgr install courier
tlmgr install helvet
tlmgr install amsmath
tlmgr install amsfonts
tlmgr install psnfss
tlmgr install pifont
tlmgr install multirow
tlmgr install babel
tlmgr install geometry
tlmgr install setspace
tlmgr install titlesec
tlmgr install graphicx
tlmgr install hyperref
tlmgr install booktabs
tlmgr install array
tlmgr install caption
tlmgr install enumitem
tlmgr install parskip
tlmgr install fancyhdr
tlmgr install tocloft
tlmgr install tabularx
tlmgr install longtable
tlmgr install ragged2e
tlmgr install csquotes
tlmgr install biblatex
tlmgr install biber
tlmgr install logreq
tlmgr install xstring
```

## Compile LaTeX
Untuk compile dokumen LaTeX, jalankan script PowerShell:
```powershell
.\compile-latex.ps1
```

Script ini akan otomatis menjalankan:
1. `pdflatex` untuk kompilasi awal
2. `biber` untuk memproses referensi
3. `pdflatex` dua kali lagi untuk finalisasi cross-references
4. Isi konten laporan pada file tex di dalam folder chapters

File utama: `bukped.tex`  
Output: `bukped.pdf`
