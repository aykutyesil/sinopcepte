package com.sinopcepte.pharmacy;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import java.io.IOException;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneId;

import org.junit.jupiter.api.Test;

/** Hata yolunda son kaydın korunması ve fetch bayrağı (Spring/DB olmadan). */
class PharmacyServiceTest {

    private final PharmacyDutyRepository repo = mock(PharmacyDutyRepository.class);
    private final PharmacyFetcher fetcher = mock(PharmacyFetcher.class);
    private final Clock clock = Clock.fixed(Instant.parse("2026-11-08T05:30:00Z"), ZoneId.of("Europe/Istanbul"));

    private PharmacyService service(boolean enabled) {
        PharmacyProperties props = new PharmacyProperties(enabled, null, null, Duration.ofSeconds(1));
        return new PharmacyService(repo, fetcher, new PharmacyParser(), props, clock);
    }

    @Test
    void disabledFetchNeverTouchesNetwork() {
        assertThat(service(false).refresh()).isFalse();
        verifyNoInteractions(fetcher);
        verify(repo, never()).save(any());
    }

    @Test
    void networkFailureKeepsLastRecordAndDoesNotThrow() throws Exception {
        when(fetcher.fetch()).thenThrow(new IOException("bağlantı reddedildi"));
        assertThat(service(true).refresh()).isFalse();
        verify(repo, never()).save(any());
    }

    @Test
    void parseFailureKeepsLastRecordAndDoesNotThrow() throws Exception {
        when(fetcher.fetch()).thenReturn("<html><body>bakımdayız</body></html>");
        assertThat(service(true).refresh()).isFalse();
        verify(repo, never()).save(any());
    }

    @Test
    void todayIsComputedInIstanbul() {
        // 05:30Z = 08:30 İstanbul, 8 Kasım
        assertThat(service(false).today()).hasToString("2026-11-08");
    }
}
