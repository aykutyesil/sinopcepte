package com.sinopcepte.pharmacy;

import java.time.Duration;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * {@code app.pharmacy.*} ayarları.
 *
 * @param fetchEnabled false ise ağdan hiçbir istek yapılmaz (testlerde kapalı)
 * @param url          kaynak (Sinop Merkez, lokasyon=1627)
 * @param userAgent    genel bir UA; kişisel e-posta vb. içermez
 * @param timeout      bağlantı + okuma zaman aşımı
 */
@ConfigurationProperties(prefix = "app.pharmacy")
public record PharmacyProperties(boolean fetchEnabled, String url, String userAgent, Duration timeout) {

    public PharmacyProperties {
        if (url == null || url.isBlank()) {
            url = "https://www.eczaneler.gen.tr/iframe.php?lokasyon=1627";
        }
        if (userAgent == null || userAgent.isBlank()) {
            userAgent = "SinopCepte/1.0";
        }
        if (timeout == null) {
            timeout = Duration.ofSeconds(15);
        }
    }
}
