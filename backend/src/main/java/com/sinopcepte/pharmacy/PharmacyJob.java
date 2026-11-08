package com.sinopcepte.pharmacy;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Nöbetçi eczane zamanlayıcısı: her sabah 08:30 (İstanbul) ve açılışta (bugünün kaydı yoksa).
 * Hiçbir koşulda exception dışarı sızmaz.
 */
@Component
public class PharmacyJob {

    public static final String CRON = "0 30 8 * * *";
    public static final String ZONE = "Europe/Istanbul";

    private static final Logger log = LoggerFactory.getLogger(PharmacyJob.class);

    private final PharmacyService service;

    public PharmacyJob(PharmacyService service) {
        this.service = service;
    }

    @Scheduled(cron = CRON, zone = ZONE)
    public void dailyRefresh() {
        try {
            service.refresh();
        } catch (Throwable t) {
            log.error("Günlük eczane işi beklenmedik hata verdi", t);
        }
    }

    @EventListener(ApplicationReadyEvent.class)
    public void refreshOnStartupIfMissing() {
        try {
            if (!service.hasRecordForToday()) {
                service.refresh();
            }
        } catch (Throwable t) {
            log.error("Açılıştaki eczane kontrolü beklenmedik hata verdi", t);
        }
    }
}
