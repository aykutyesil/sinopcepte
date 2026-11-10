# Model Routing & Token Optimization Rules

Sen baş mimar olarak ana modelde (Opus / Sonnet) çalışıyorsun. Ana model kotasını ve bağlam (context) penceresini korumak birinci önceliğindir.

## 1. Zorunlu Subagent Delegasyonu (`haiku-worker`)
Aşağıdaki işlemleri **ASLA** ana oturumda kendin yapma; her zaman `haiku-worker` alt ajanına (`model: haiku`) devret:
- Kod tabanında dosya veya metin arama (`Grep`, `Glob`, geniş çaplı `Read` taramaları).
- Testleri, linter'ları veya build komutlarını (`Bash`) çalıştırıp sonuçlarını kontrol etme.
- Basit DTO, entity, interface, çeviri dosyası, birim testi veya standart CRUD/boilerplate kodlarını yazma.
- Büyük log veya JSON dosyalarını okuyup içinden spesifik veri ayıklama.

## 2. Ana Oturum Görev Sınırları
Ana oturumda sadece şu işleri yap:
- Mimari tasarım, algoritma kurgusu ve karmaşık hata ayıklama (deep debugging).
- `haiku-worker` alt ajanından gelen kısa özetleri değerlendirip nihai entegrasyon kararlarını verme.

## 3. Yanıt Disiplini (Minimal Token Output)
- Kodu yazdıktan sonra "Şunu yaptım, bunu ekledim" diye açıklama yapma.
- Değişmeyen kod bloklarını tekrar ekrana basma.
- Sadece doğrudan çözümü, diff'i ve varsa kritik uyarıyı yaz.
