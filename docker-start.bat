@echo off
chcp 65001 > nul
echo ========================================================
echo   SinopCepte Docker Konteynerleri Baslatiliyor...
echo ========================================================

where docker >nul 2>nul
if %errorlevel% neq 0 (
    echo [HATA] Sistemde Docker bulunamadi!
    echo Lutfen Docker Desktop'in kurulu ve calisir oldugundan emin olun.
    pause
    exit /b 1
)

if not exist .env (
    echo [BILGI] .env dosyasi bulunamadi, .env.example kopyalaniyor...
    copy .env.example .env
)

echo [1/2] Konteynerler derleniyor ve baslatiliyor...
docker compose up -d --build

echo [2/2] Durum kontrol ediliyor...
docker compose ps

echo ========================================================
echo   SinopCepte basariyla baslatildi!
echo   Web Adresi: http://localhost:3000
echo ========================================================
pause
