# SinopCepte - Günlük Nöbetçi Eczane Otomatik Güncelleyici
# Kaynak: https://www.eczaneler.gen.tr/nobetci-sinop-merkez (Lokasyon: 1627 - Sinop Merkez)

$ErrorActionPreference = "SilentlyContinue"
$projectDir = Split-Path -Parent $MyInvocation.MyCommand.Path

try {
    Write-Host "[SinopCepte] Eczaneler.gen.tr sitesinden Sinop Merkez nöbetçi eczane verisi çekiliyor..." -ForegroundColor Cyan
    $webClient = New-Object System.Net.WebClient
    $webClient.Encoding = [System.Text.Encoding]::UTF8
    $webClient.Headers.Add("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64)")
    $raw = $webClient.DownloadString("https://www.eczaneler.gen.tr/iframe.php?lokasyon=1627")

    $name = if ($raw -match "<b>([^<]+)</b></span>") { $matches[1].Trim() } else { "" }
    $map = if ($raw -match 'href="([^"]+maps[^"]+)"') { $matches[1].Trim() } else { "" }
    $phone = if ($raw -match "<td>([0-9\s\(\)-]{10,20})</td>") { $matches[1].Trim() } else { "" }
    $address = if ($raw -match "alt='adres'></td><td>([^<]+)</td>") { $matches[1].Trim() } else { "" }

    if (-not $name) {
        Write-Host "[Uyarı] Eczane verisi ayrıştırılamadı." -ForegroundColor Yellow
        exit 1
    }

    $cleanPhone = ($phone -replace '[^0-9]', '')
    if ($cleanPhone.StartsWith("0")) { $cleanPhone = $cleanPhone.Substring(1) }
    $phoneFormatted = "0" + $cleanPhone

    # 1. pharmacy.json Kaydet
    $pharmacyData = [ordered]@{
        name = $name
        mapUrl = $map
        phone = $phone
        phoneFormatted = $phoneFormatted
        address = $address
        updatedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
    }

    $jsonStr = $pharmacyData | ConvertTo-Json
    $jsonPath = Join-Path $projectDir "pharmacy.json"
    [System.IO.File]::WriteAllText($jsonPath, $jsonStr, [System.Text.Encoding]::UTF8)

    # 2. 4 Tasarım Klasörüne de Dağıt
    $targetFolders = @(
        "C:\Users\Aykut\Desktop\sinopcepte-tarz1-ios-glass",
        "C:\Users\Aykut\Desktop\sinopcepte-tarz2-neon-gece",
        "C:\Users\Aykut\Desktop\sinopcepte-tarz3-superapp",
        "C:\Users\Aykut\Desktop\sinopcepte-tarz4-butik-editorial"
    )
    foreach ($tf in $targetFolders) {
        if (Test-Path $tf) {
            $destJson = Join-Path $tf "pharmacy.json"
            [System.IO.File]::WriteAllText($destJson, $jsonStr, [System.Text.Encoding]::UTF8)
        }
    }

    Write-Host "[Başarılı] Güncel Nöbetçi: $name" -ForegroundColor Green
    Write-Host "[Adres] $address" -ForegroundColor Gray
    Write-Host "[Telefon] $phone" -ForegroundColor Gray
    Write-Host "[Harita] $map" -ForegroundColor Gray
    Write-Host "[Tamamlandı] Tüm klasörlerdeki pharmacy.json güncellendi." -ForegroundColor Green
} catch {
    Write-Host "[Hata] $($_.Exception.Message)" -ForegroundColor Red
}
