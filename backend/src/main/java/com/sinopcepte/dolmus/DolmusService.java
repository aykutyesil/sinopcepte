package com.sinopcepte.dolmus;

import java.io.IOException;
import java.io.InputStream;
import java.time.Clock;
import java.time.DayOfWeek;
import java.time.Duration;
import java.time.LocalTime;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

/** Hat verisi seed/dolmus.json'dan yüklenir (veritabanı yok); "şimdi" Clock'tan gelir. */
@Service
public class DolmusService {

    private static final DateTimeFormatter HHMM = DateTimeFormatter.ofPattern("HH:mm");
    static final int NEXT_COUNT = 3;

    private final Clock clock;
    private final List<DolmusLine> lines;
    private final String source;
    private final boolean official;
    private final String disclaimer;
    private final String retrievedAt;

    public DolmusService(Clock clock) throws IOException {
        this.clock = clock;
        try (InputStream in = DolmusService.class.getResourceAsStream("/seed/dolmus.json")) {
            if (in == null) {
                throw new IllegalStateException("seed/dolmus.json bulunamadı");
            }
            JsonNode root = JsonMapper.builder().build().readTree(in);
            this.source = root.get("source").asString();
            this.official = root.get("official").asBoolean();
            this.disclaimer = root.get("disclaimer").asString();
            this.retrievedAt = root.get("retrievedAt").asString();
            List<DolmusLine> parsed = new ArrayList<>();
            for (JsonNode n : root.get("lines")) {
                List<DolmusLine.Point> points = new ArrayList<>();
                for (JsonNode p : n.get("points")) {
                    List<LocalTime> times = new ArrayList<>();
                    p.get("times").forEach(t -> times.add(LocalTime.parse(t.asString())));
                    times.sort(null);
                    points.add(new DolmusLine.Point(p.get("from").asString(), p.get("days").asString(),
                            List.copyOf(times), text(p, "note")));
                }
                parsed.add(new DolmusLine(n.get("id").asString(), n.get("name").asString(), text(n, "note"),
                        List.copyOf(points)));
            }
            this.lines = List.copyOf(parsed);
        }
    }

    private static String text(JsonNode n, String field) {
        JsonNode v = n.get(field);
        return v == null || v.isNull() ? null : v.asString();
    }

    public DolmusResponse snapshot() {
        ZonedDateTime now = ZonedDateTime.now(clock);
        LocalTime t = now.toLocalTime().withSecond(0).withNano(0);
        DayOfWeek day = now.getDayOfWeek();
        List<DolmusLineDto> dtos = lines.stream().map(l -> toDto(l, t, day)).toList();
        return new DolmusResponse(now.toOffsetDateTime().toString(), source, official, disclaimer, retrievedAt, dtos);
    }

    static DolmusLineDto toDto(DolmusLine l, LocalTime now, DayOfWeek day) {
        List<DolmusLineDto.PointDto> points = l.points().stream()
                .filter(p -> p.appliesOn(day))
                .map(p -> {
                    List<LocalTime> next = p.nextAfter(now, NEXT_COUNT);
                    Integer minutes = next.isEmpty() ? null : (int) Duration.between(now, next.get(0)).toMinutes();
                    return new DolmusLineDto.PointDto(p.from(), p.days(),
                            HHMM.format(p.times().get(0)), HHMM.format(p.times().get(p.times().size() - 1)),
                            next.stream().map(HHMM::format).toList(), minutes,
                            p.times().stream().map(HHMM::format).toList(), p.note());
                })
                .toList();
        return new DolmusLineDto(l.id(), l.name(), l.note(), points);
    }
}
