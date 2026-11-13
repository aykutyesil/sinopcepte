package com.sinopcepte.pharmacy;

import static org.assertj.core.api.Assertions.assertThat;

import java.lang.reflect.Method;

import org.junit.jupiter.api.Test;
import org.springframework.scheduling.annotation.Scheduled;

class PharmacyJobScheduleTest {

    @Test
    void dailyRefreshRunsAt0830Istanbul() throws Exception {
        Method m = PharmacyJob.class.getMethod("dailyRefresh");
        Scheduled s = m.getAnnotation(Scheduled.class);

        assertThat(s).as("@Scheduled var").isNotNull();
        assertThat(s.cron()).isEqualTo("0 30 8 * * *");
        assertThat(s.zone()).isEqualTo("Europe/Istanbul");
    }
}
