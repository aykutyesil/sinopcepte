package com.sinopcepte.pharmacy;

import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.springframework.stereotype.Component;

/**
 * {@code https://www.eczaneler.gen.tr/iframe.php?lokasyon=1627} yanıtını Jsoup ile ayrıştırır.
 *
 * <p>Sayfada satır kapanışları eksik ({@code </tr>} yok), bu yüzden satır sırasına değil
 * sabit işaretlere bakılır:
 * <ul>
 *   <li>ad: {@code span.text-dark > b}</li>
 *   <li>harita: {@code a[href*=maps]}, koordinatlar linkteki {@code daddr=LAT,LNG}</li>
 *   <li>telefon: {@code img[alt=telefon]} hücresinin yanındaki hücre</li>
 *   <li>adres: {@code img[alt=adres]} hücresinin yanındaki hücre</li>
 * </ul>
 * Birden çok nöbetçi varsa ilki alınır (eski PowerShell betiğiyle aynı davranış).
 */
@Component
public class PharmacyParser {

    private static final Pattern DADDR = Pattern.compile("^(-?\\d+(?:\\.\\d+)?),\\s*(-?\\d+(?:\\.\\d+)?)$");

    public ParsedPharmacy parse(String html) {
        if (html == null || html.isBlank()) {
            throw new PharmacyParseException("Boş yanıt");
        }
        Document doc = Jsoup.parse(html);

        Element nameEl = doc.selectFirst("span.text-dark > b");
        if (nameEl == null) {
            nameEl = doc.selectFirst("td span > b");
        }
        String name = nameEl == null ? "" : nameEl.text().trim();
        if (name.isEmpty()) {
            throw new PharmacyParseException("Eczane adı bulunamadı");
        }

        Element mapEl = doc.selectFirst("a[href*=maps]");
        String mapUrl = mapEl == null ? null : mapEl.attr("href").trim();

        String phone = siblingCellText(doc, "img[alt=telefon]");
        if (phone == null || !phone.matches("[0-9\\s()\\-]{10,20}")) {
            throw new PharmacyParseException("Telefon bulunamadı veya biçimi beklenmedik: " + phone);
        }
        String phoneFormatted = formatPhone(phone);

        String address = siblingCellText(doc, "img[alt=adres]");
        if (address == null || address.isEmpty()) {
            throw new PharmacyParseException("Adres bulunamadı");
        }

        Double lat = null;
        Double lng = null;
        if (mapUrl != null) {
            String daddr = queryParam(mapUrl, "daddr");
            if (daddr != null) {
                Matcher m = DADDR.matcher(daddr.trim());
                if (m.matches()) {
                    lat = Double.valueOf(m.group(1));
                    lng = Double.valueOf(m.group(2));
                }
            }
        }

        return new ParsedPharmacy(name, address, phone, phoneFormatted, mapUrl, lat, lng);
    }

    /** "0 (368) 261-72-36" → "03682617236" (eski betikteki kural: rakamlar, başta tek 0). */
    static String formatPhone(String phone) {
        String digits = phone.replaceAll("[^0-9]", "");
        if (digits.startsWith("0")) {
            digits = digits.substring(1);
        }
        return "0" + digits;
    }

    private static String siblingCellText(Document doc, String iconSelector) {
        Element icon = doc.selectFirst(iconSelector);
        if (icon == null) {
            return null;
        }
        Element cell = icon.closest("td");
        if (cell == null) {
            return null;
        }
        Element next = cell.nextElementSibling();
        return next == null ? null : next.text().trim();
    }

    private static String queryParam(String url, String key) {
        try {
            String query = URI.create(url).getRawQuery();
            if (query == null) {
                return null;
            }
            for (String pair : query.split("&")) {
                int eq = pair.indexOf('=');
                if (eq > 0 && pair.substring(0, eq).equals(key)) {
                    return URLDecoder.decode(pair.substring(eq + 1), StandardCharsets.UTF_8);
                }
            }
            return null;
        } catch (IllegalArgumentException e) {
            return null;
        }
    }
}
