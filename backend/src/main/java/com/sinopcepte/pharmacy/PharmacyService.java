package com.sinopcepte.pharmacy;

import java.time.Clock;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PharmacyService {

    private static final Logger log = LoggerFactory.getLogger(PharmacyService.class);

    private final PharmacyDutyRepository repo;
    private final PharmacyFetcher fetcher;
    private final PharmacyParser parser;
    private final PharmacyProperties props;
    private final Clock clock;

    public PharmacyService(PharmacyDutyRepository repo, PharmacyFetcher fetcher, PharmacyParser parser,
                           PharmacyProperties props, Clock clock) {
        this.repo = repo;
        this.fetcher = fetcher;
        this.parser = parser;
        this.props = props;
        this.clock = clock;
    }

    /** Gösterilecek kayıt: en son kaydedilen (bugünkü yoksa son bilinen). */
    @Transactional(readOnly = true)
    public Optional<PharmacyDuty> latest() {
        return repo.findFirstByOrderByDutyDateDescIdDesc();
    }

    public LocalDate today() {
        return LocalDate.now(clock);
    }

    @Transactional(readOnly = true)
    public boolean hasRecordForToday() {
        return repo.findByDutyDate(today()).isPresent();
    }

    /**
     * Kaynaktan çekip bugünün kaydını oluşturur/günceller. Hata olursa son kayıt korunur,
     * hata loglanır ve dışarı exception fırlatılmaz.
     *
     * @return kayıt güncellendiyse true
     */
    public boolean refresh() {
        if (!props.fetchEnabled()) {
            log.info("Nöbetçi eczane çekme kapalı (app.pharmacy.fetch-enabled=false); atlanıyor.");
            return false;
        }
        try {
            String html = fetcher.fetch();
            ParsedPharmacy parsed = parser.parse(html);
            save(parsed);
            log.info("Nöbetçi eczane güncellendi: {}", parsed.name());
            return true;
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            log.warn("Nöbetçi eczane çekme kesildi; son kayıt korunuyor.");
            return false;
        } catch (Exception e) {
            log.warn("Nöbetçi eczane çekilemedi/ayrıştırılamadı; son kayıt korunuyor. Sebep: {}", e.toString());
            return false;
        }
    }

    /** Ayrıştırılmış veriyi bugünün kaydı olarak yazar (upsert). */
    @Transactional
    public PharmacyDuty save(ParsedPharmacy parsed) {
        LocalDate today = today();
        PharmacyDuty duty = repo.findByDutyDate(today).orElseGet(() -> new PharmacyDuty(today));
        duty.apply(parsed, OffsetDateTime.now(clock));
        return repo.save(duty);
    }
}
