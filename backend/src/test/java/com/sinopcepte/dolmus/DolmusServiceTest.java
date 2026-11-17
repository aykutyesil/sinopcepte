package com.sinopcepte.dolmus;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneId;

import org.junit.jupiter.api.Test;

class DolmusServiceTest {

    private static final ZoneId TR = ZoneId.of("Europe/Istanbul");

    // 2026-11-16 Pazartesi, 2026-11-21 Cumartesi (TSİ = UTC+3)
    private static DolmusResponse at(String iso) throws Exception {
        return new DolmusService(Clock.fixed(Instant.parse(iso), TR)).snapshot();
    }

    private static DolmusLineDto line(DolmusResponse r, String id) {
        return r.lines().stream().filter(l -> l.id().equals(id)).findFirst().orElseThrow();
    }

    @Test
    void seedHasOnlyCityLinesAndIsMarkedUnofficial() throws Exception {
        DolmusResponse r = at("2026-11-16T07:10:00Z");
        assertThat(r.official()).isFalse();
        assertThat(r.source()).contains("sinopdolmus.com");
        assertThat(r.lines()).hasSizeGreaterThanOrEqualTo(15);
        assertThat(r.lines()).extracting(DolmusLineDto::id).doesNotContain("sinop-boyabat", "gerze-sinop");
    }

    @Test
    void nextThreeTripsFromPatternLine() throws Exception {
        // Pzt 10:10 TSİ; Özlem hattı :03 ve :33'te
        DolmusLineDto.PointDto p = line(at("2026-11-16T07:10:00Z"), "ozlem-zeytinlik-hastane").points().get(0);
        assertThat(p.next()).containsExactly("10:33", "11:03", "11:33");
        assertThat(p.minutesToNext()).isEqualTo(23);
        assertThat(p.firstDeparture()).isEqualTo("07:03");
        assertThat(p.lastDeparture()).isEqualTo("18:33");
        assertThat(p.times()).hasSize(24).startsWith("07:03", "07:33", "08:03").endsWith("18:33");
    }

    @Test
    void departureAtExactMinuteCountsAsNext() throws Exception {
        DolmusLineDto.PointDto p = line(at("2026-11-16T07:03:00Z"), "karakum").points().get(0); // 10:03... Hastane :15
        assertThat(p.next().get(0)).isEqualTo("10:15");
        DolmusLineDto.PointDto q = line(at("2026-11-16T07:15:00Z"), "karakum").points().get(0); // 10:15
        assertThat(q.next().get(0)).isEqualTo("10:15");
        assertThat(q.minutesToNext()).isZero();
    }

    @Test
    void afterLastTripNothingLeft() throws Exception {
        DolmusLineDto.PointDto p = line(at("2026-11-16T16:00:00Z"), "ozlem-zeytinlik-hastane").points().get(0); // 19:00
        assertThat(p.next()).isEmpty();
        assertThat(p.minutesToNext()).isNull();
    }

    @Test
    void fewerThanThreeLeftNearEndOfService() throws Exception {
        DolmusLineDto.PointDto p = line(at("2026-11-16T15:30:00Z"), "ozlem-zeytinlik-hastane").points().get(0); // 18:30
        assertThat(p.next()).containsExactly("18:33");
    }

    @Test
    void weekdayOnlyPointsHiddenOnSaturdayAndWeekendOnlyShown() throws Exception {
        DolmusLineDto weekdayLine = line(at("2026-11-16T07:10:00Z"), "sib-akliman");
        assertThat(weekdayLine.points()).extracting(DolmusLineDto.PointDto::days).containsExactly("weekday");

        DolmusLineDto sat = line(at("2026-11-21T07:10:00Z"), "sib-akliman");
        assertThat(sat.points()).extracting(DolmusLineDto.PointDto::days).containsExactly("weekend");
        assertThat(sat.points().get(0).next()).containsExactly("10:30", "11:30", "12:30");

        assertThat(line(at("2026-11-21T07:10:00Z"), "kuzeykent-hastane").points()).isEmpty();
    }
}
