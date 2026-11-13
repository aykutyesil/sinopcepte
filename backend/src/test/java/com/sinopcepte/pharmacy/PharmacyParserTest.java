package com.sinopcepte.pharmacy;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;

import org.junit.jupiter.api.Test;

/** Ağ yok: kaydedilmiş gerçek yanıt (test/resources/pharmacy/sinop-merkez.html) üzerinde. */
class PharmacyParserTest {

    private final PharmacyParser parser = new PharmacyParser();

    private static String fixture() throws Exception {
        try (InputStream in = PharmacyParserTest.class.getResourceAsStream("/pharmacy/sinop-merkez.html")) {
            assertThat(in).as("fikstür dosyası").isNotNull();
            return new String(in.readAllBytes(), StandardCharsets.UTF_8);
        }
    }

    @Test
    void parsesSinopMerkezFixtureExactly() throws Exception {
        ParsedPharmacy p = parser.parse(fixture());

        assertThat(p.name()).isEqualTo("Elif Eczanesi");
        assertThat(p.phone()).isEqualTo("0 (368) 261-72-36");
        assertThat(p.phoneFormatted()).isEqualTo("03682617236");
        assertThat(p.address()).startsWith("Kaleyazısı Mahallesi")
                .isEqualTo("Kaleyazısı Mahallesi, Sakarya Caddesi, No:77/B Merkez / Sinop");
        assertThat(p.mapUrl()).isEqualTo("https://www.google.com/maps?daddr=42.0257925,35.1457768");
        assertThat(p.lat()).isEqualTo(42.0257925);
        assertThat(p.lng()).isEqualTo(35.1457768);
    }

    @Test
    void phoneFormattingMatchesLegacyRule() {
        assertThat(PharmacyParser.formatPhone("0 (368) 261-72-36")).isEqualTo("03682617236");
        assertThat(PharmacyParser.formatPhone("(368) 261 72 36")).isEqualTo("03682617236");
    }

    @Test
    void rejectsPageWithoutPharmacyName() {
        String html = "<html><body><table><tr><td>Bugün nöbetçi eczane bulunamadı</td></tr></table></body></html>";
        assertThatThrownBy(() -> parser.parse(html)).isInstanceOf(PharmacyParseException.class);
    }

    @Test
    void rejectsEmptyBody() {
        assertThatThrownBy(() -> parser.parse("")).isInstanceOf(PharmacyParseException.class);
    }
}
