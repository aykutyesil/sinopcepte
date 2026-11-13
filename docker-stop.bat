@echo off
chcp 65001 > nul
echo ========================================================
echo   SinopCepte Docker Konteynerleri Durduruluyor...
echo ========================================================

where docker >nul 2>nul
if %errorlevel% neq 0 (
    echo [HATA] Sistemde Docker bulunamadi!
    pause
    exit /b 1
)

docker compose down

echo ========================================================
echo   Tum konteynerler durduruldu.
echo ========================================================
pause
