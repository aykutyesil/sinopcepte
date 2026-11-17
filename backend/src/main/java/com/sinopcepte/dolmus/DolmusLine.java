package com.sinopcepte.dolmus;

import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.List;

/** Şehir içi hat: bir veya daha fazla kalkış noktası (yön) ve her birinin sıralı kalkış saatleri. */
public record DolmusLine(String id, String name, String note, List<Point> points) {

    /** days: "all" | "weekday" (Pzt–Cum) | "weekend" (Cmt–Paz). */
    public record Point(String from, String days, List<LocalTime> times, String note) {

        public boolean appliesOn(DayOfWeek d) {
            boolean weekend = d == DayOfWeek.SATURDAY || d == DayOfWeek.SUNDAY;
            return switch (days) {
                case "weekday" -> !weekend;
                case "weekend" -> weekend;
                default -> true;
            };
        }

        /** now dahil, sonraki en çok count kalkış (bugün bitmişse boş). */
        public List<LocalTime> nextAfter(LocalTime now, int count) {
            return times.stream().filter(t -> !t.isBefore(now)).limit(count).toList();
        }
    }
}
