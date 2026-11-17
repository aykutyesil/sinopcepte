package com.sinopcepte.dolmus;

import java.util.List;

/** Bugün geçerli kalkış noktaları (hafta içi/sonu filtrelenmiş) ve her biri için sıradaki seferler. */
public record DolmusLineDto(String id, String name, String note, List<PointDto> points) {

    public record PointDto(
            String from,
            /** "all" | "weekday" | "weekend" */
            String days,
            String firstDeparture,
            String lastDeparture,
            /** Şimdiden sonraki en çok 3 sefer "HH:mm"; bugünkü seferler bittiyse boş. */
            List<String> next,
            /** Sıradaki sefere kalan dakika; sefer kalmadıysa null. */
            Integer minutesToNext,
            /** Bugünün tüm kalkış saatleri (sıralı, "HH:mm"). */
            List<String> times,
            String note) {
    }
}
