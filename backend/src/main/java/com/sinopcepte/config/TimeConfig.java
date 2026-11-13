package com.sinopcepte.config;

import java.time.Clock;
import java.time.ZoneId;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/** Uygulamanın "bugün"ü ve zaman damgaları İstanbul saatine göre hesaplanır. */
@Configuration(proxyBeanMethods = false)
public class TimeConfig {

    @Bean
    Clock clock(@Value("${app.time-zone:Europe/Istanbul}") String zone) {
        return Clock.system(ZoneId.of(zone));
    }
}
