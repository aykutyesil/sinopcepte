package com.sinopcepte.pharmacy;

import java.time.LocalDate;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface PharmacyDutyRepository extends JpaRepository<PharmacyDuty, Long> {

    Optional<PharmacyDuty> findByDutyDate(LocalDate dutyDate);

    /** En son kayıt; çekme başarısız olursa son bilinen eczane gösterilmeye devam eder. */
    Optional<PharmacyDuty> findFirstByOrderByDutyDateDescIdDesc();
}
