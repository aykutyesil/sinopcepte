# SinopCepte - Günlük Nöbetçi Eczane Otomatik Güncelleyici
# Kaynak: https://www.eczaneler.gen.tr/iframe.php?lokasyon=1627 (Lokasyon: 1627 - Sinop Merkez)

$ErrorActionPreference = "SilentlyContinue"
$projectDir = Split-Path -Parent $MyInvocation.MyCommand.Path
if (-not $projectDir) { $projectDir = Get-Location }

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

    # Koordinatları harita linkinden ayrıştır
    $lat = "42.0257925"
    $lng = "35.1457768"
    if ($map -match "daddr=([0-9\.]+),([0-9\.]+)") {
        $lat = $matches[1]
        $lng = $matches[2]
    }

    # 1. JSON Verisi
    $pharmacyData = [ordered]@{
        name           = $name
        mapUrl         = $map
        phone          = $phone
        phoneFormatted = $phoneFormatted
        address        = $address
        lat            = $lat
        lng            = $lng
        updatedAt      = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
    }
    $jsonStr = $pharmacyData | ConvertTo-Json

    $allFolders = @(
        $projectDir,
        (Join-Path $projectDir "tasarim1-harita-explorer"),
        (Join-Path $projectDir "tasarim2-bento-dashboard"),
        (Join-Path $projectDir "tasarim3-zaman-cizelgesi"),
        (Join-Path $projectDir "tasarim4-canli-radar-feed"),
        "C:\Users\Aykut\Desktop\gece-hayati-portali",
        "C:\Users\Aykut\Desktop\tasarim1-harita-explorer",
        "C:\Users\Aykut\Desktop\tasarim2-bento-dashboard",
        "C:\Users\Aykut\Desktop\tasarim3-zaman-cizelgesi",
        "C:\Users\Aykut\Desktop\tasarim4-canli-radar-feed"
    ) | Select-Object -Unique

    # 2. JSON Dosyalarını Dağıt
    foreach ($folder in $allFolders) {
        if (Test-Path $folder) {
            $destJson = Join-Path $folder "pharmacy.json"
            [System.IO.File]::WriteAllText($destJson, $jsonStr, [System.Text.Encoding]::UTF8)
        }
    }

    $pin = [char]::ConvertFromUtf32(0x1F4CD)

    # 3. HTML Dosyalarını Doğrudan Güncelle
    # 3.1 Ana Portal Dosyaları
    $mainHtmls = @(
        (Join-Path $projectDir "index.html"),
        "C:\Users\Aykut\Desktop\gece-hayati-portali\index.html"
    ) | Select-Object -Unique
    foreach ($mh in $mainHtmls) {
        if (Test-Path $mh) {
            $c = [System.IO.File]::ReadAllText($mh, [System.Text.Encoding]::UTF8)
            $c = [regex]::Replace($c, '(<span id="headerPharmacyName"[^>]*>)[^<]*(</span>)', "`${1}$name`${2}")
            $c = [regex]::Replace($c, '(<a\s+id="headerPharmacyBtn"\s+href=")[^"]*(")', "`${1}$map`${2}")
            $c = [regex]::Replace($c, "(id:\s*'e-1'[\s\S]*?title:\s*')[^']*(')", "`${1}$name (Sinop Merkez Nöbetçi)`${2}")
            $c = [regex]::Replace($c, "(id:\s*'e-1'[\s\S]*?location:\s*')[^']*(')", "`${1}$pin $address`${2}")
            $c = [regex]::Replace($c, "(id:\s*'e-1'[\s\S]*?phone:\s*')[^']*(')", "`${1}$phoneFormatted`${2}")
            $c = [regex]::Replace($c, "(id:\s*'e-1'[\s\S]*?mapUrl:\s*')[^']*(')", "`${1}$map`${2}")
            $c = [regex]::Replace($c, "(id:\s*'e-1'[\s\S]*?wa:\s*')[^']*(')", "`${1}9$phoneFormatted`${2}")
            [System.IO.File]::WriteAllText($mh, $c, [System.Text.Encoding]::UTF8)
        }
    }

    # 3.2 Tasarım 1 - Harita Explorer
    $t1Htmls = @(
        (Join-Path $projectDir "tasarim1-harita-explorer\index.html"),
        "C:\Users\Aykut\Desktop\tasarim1-harita-explorer\index.html"
    ) | Select-Object -Unique
    foreach ($t1 in $t1Htmls) {
        if (Test-Path $t1) {
            $c = [System.IO.File]::ReadAllText($t1, [System.Text.Encoding]::UTF8)
            $c = [regex]::Replace($c, '(<span id="headerPharmacyName"[^>]*>)[^<]*(</span>)', "`${1}$name`${2}")
            $c = [regex]::Replace($c, '(<a\s+id="headerPharmacyBtn"\s+href=")[^"]*(")', "`${1}$map`${2}")
            $c = [regex]::Replace($c, "(id:\s*'e-1'[\s\S]*?title:\s*')[^']*(')", "`${1}$name (Sinop Merkez Nöbetçi)`${2}")
            $c = [regex]::Replace($c, "(id:\s*'e-1'[\s\S]*?location:\s*')[^']*(')", "`${1}$pin $address`${2}")
            $c = [regex]::Replace($c, "(id:\s*'e-1'[\s\S]*?lat:\s*)[0-9\.]+(,)", "`${1}$lat`${2}")
            $c = [regex]::Replace($c, "(id:\s*'e-1'[\s\S]*?lng:\s*)[0-9\.]+(,)", "`${1}$lng`${2}")
            $c = [regex]::Replace($c, "(id:\s*'e-1'[\s\S]*?phone:\s*')[^']*(')", "`${1}$phoneFormatted`${2}")
            $c = [regex]::Replace($c, "(id:\s*'e-1'[\s\S]*?mapUrl:\s*')[^']*(')", "`${1}$map`${2}")
            $c = [regex]::Replace($c, "(id:\s*'e-1'[\s\S]*?wa:\s*')[^']*(')", "`${1}9$phoneFormatted`${2}")
            [System.IO.File]::WriteAllText($t1, $c, [System.Text.Encoding]::UTF8)
        }
    }

    # 3.3 Tasarım 2 - Bento Dashboard
    $t2Htmls = @(
        (Join-Path $projectDir "tasarim2-bento-dashboard\index.html"),
        "C:\Users\Aykut\Desktop\tasarim2-bento-dashboard\index.html"
    ) | Select-Object -Unique
    foreach ($t2 in $t2Htmls) {
        if (Test-Path $t2) {
            $c = [System.IO.File]::ReadAllText($t2, [System.Text.Encoding]::UTF8)
            $c = [regex]::Replace($c, '(<h3 id="bentoPharmacyName"[^>]*>)[^<]*(</h3>)', "`${1}$name`${2}")
            $c = [regex]::Replace($c, '(<p id="bentoPharmacyAddress"[^>]*>)[^<]*(</p>)', "`${1}$address`${2}")
            $c = [regex]::Replace($c, '(<a\s+id="bentoPharmacyMapBtn"\s+href=")[^"]*(")', "`${1}$map`${2}")
            $c = [regex]::Replace($c, '(<a\s+id="bentoPharmacyPhoneBtn"\s+href="tel:)[^"]*(")', "`${1}$phoneFormatted`${2}")
            [System.IO.File]::WriteAllText($t2, $c, [System.Text.Encoding]::UTF8)
        }
    }

    # 3.4 Tasarım 3 - Zaman Çizelgesi
    $t3Htmls = @(
        (Join-Path $projectDir "tasarim3-zaman-cizelgesi\index.html"),
        "C:\Users\Aykut\Desktop\tasarim3-zaman-cizelgesi\index.html"
    ) | Select-Object -Unique
    foreach ($t3 in $t3Htmls) {
        if (Test-Path $t3) {
            $c = [System.IO.File]::ReadAllText($t3, [System.Text.Encoding]::UTF8)
            $c = [regex]::Replace($c, '(<span id="headerPharmacyName"[^>]*>)[^<]*(</span>)', "`${1}$name`${2}")
            $c = [regex]::Replace($c, '(<a\s+id="headerPharmacyBtn"\s+href=")[^"]*(")', "`${1}$map`${2}")
            $c = [regex]::Replace($c, '(<h4 id="timelinePharmacyName"[^>]*>)[^<]*(</h4>)', "`${1}$name`${2}")
            $c = [regex]::Replace($c, '(<p id="timelinePharmacyAddr"[^>]*>)[^<]*(</p>)', "`${1}$address`${2}")
            $c = [regex]::Replace($c, '(<a\s+id="timelinePharmacyMapBtn"\s+href=")[^"]*(")', "`${1}$map`${2}")
            [System.IO.File]::WriteAllText($t3, $c, [System.Text.Encoding]::UTF8)
        }
    }

    # 3.5 Tasarım 4 - Canlı Radar
    $t4Htmls = @(
        (Join-Path $projectDir "tasarim4-canli-radar-feed\index.html"),
        "C:\Users\Aykut\Desktop\tasarim4-canli-radar-feed\index.html"
    ) | Select-Object -Unique
    foreach ($t4 in $t4Htmls) {
        if (Test-Path $t4) {
            $c = [System.IO.File]::ReadAllText($t4, [System.Text.Encoding]::UTF8)
            $c = [regex]::Replace($c, '(<h3 id="radarPharmacyName"[^>]*>)[^<]*(</h3>)', "`${1}$name`${2}")
            $c = [regex]::Replace($c, '(<span id="mobRadarPharmacyName"[^>]*>)[^<]*(</span>)', "`${1}$name`${2}")
            $c = [regex]::Replace($c, '(<p id="radarPharmacyAddr"[^>]*>)[^<]*(</p>)', "`${1}$address`${2}")
            $c = [regex]::Replace($c, '(<a\s+id="radarPharmacyMapBtn"\s+href=")[^"]*(")', "`${1}$map`${2}")
            $c = [regex]::Replace($c, '(<a\s+id="mobRadarPharmacyMapBtn"\s+href=")[^"]*(")', "`${1}$map`${2}")
            $c = [regex]::Replace($c, "(id:\s*'e-1'[\s\S]*?title:\s*')[^']*(')", "`${1}$name (Sinop Merkez Nöbetçi)`${2}")
            $c = [regex]::Replace($c, "(id:\s*'e-1'[\s\S]*?location:\s*')[^']*(')", "`${1}$pin $address`${2}")
            $c = [regex]::Replace($c, "(id:\s*'e-1'[\s\S]*?phone:\s*')[^']*(')", "`${1}$phoneFormatted`${2}")
            $c = [regex]::Replace($c, "(id:\s*'e-1'[\s\S]*?mapUrl:\s*')[^']*(')", "`${1}$map`${2}")
            $c = [regex]::Replace($c, "(id:\s*'e-1'[\s\S]*?wa:\s*')[^']*(')", "`${1}9$phoneFormatted`${2}")
            [System.IO.File]::WriteAllText($t4, $c, [System.Text.Encoding]::UTF8)
        }
    }

    Write-Host "[Başarılı] Güncel Nöbetçi: $name" -ForegroundColor Green
    Write-Host "[Tamamlandı] Hem pharmacy.json hem tüm index.html sayfaları güncellendi." -ForegroundColor Green
} catch {
    Write-Host "[Hata] $($_.Exception.Message)" -ForegroundColor Red
}