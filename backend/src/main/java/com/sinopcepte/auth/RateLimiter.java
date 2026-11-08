package com.sinopcepte.auth;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import com.sinopcepte.web.TooManyRequestsException;

/**
 * Bellek içi kayan pencere sayacı (tek örnek için yeterli; çok örnekte paylaşılan depo gerekir).
 * Anahtar istemci IP'sidir. Pencere dışına düşen kayıtlar her erişimde budanır.
 */
public final class RateLimiter {

    /** Bu kadar anahtardan sonra boş/eskimiş anahtarlar topluca silinir (bellek sınırı). */
    private static final int SWEEP_THRESHOLD = 10_000;

    private final int max;
    private final Duration window;
    private final Clock clock;
    private final Map<String, Deque<Instant>> hits = new ConcurrentHashMap<>();

    public RateLimiter(int max, Duration window, Clock clock) {
        this.max = max;
        this.window = window;
        this.clock = clock;
    }

    /** Sınır dolmuşsa 429 fırlatır; sayaç artmaz. */
    public void check(String key) {
        Instant now = clock.instant();
        Deque<Instant> q = hits.get(key);
        if (q == null) {
            return;
        }
        synchronized (q) {
            prune(q, now);
            if (q.size() >= max) {
                Instant oldest = q.peekFirst();
                long retry = Duration.between(now, oldest.plus(window)).toSeconds() + 1;
                throw new TooManyRequestsException(retry);
            }
        }
    }

    /** Bir denemeyi kaydeder. */
    public void record(String key) {
        Instant now = clock.instant();
        if (hits.size() > SWEEP_THRESHOLD) {
            sweep(now);
        }
        Deque<Instant> q = hits.computeIfAbsent(key, k -> new ArrayDeque<>());
        synchronized (q) {
            prune(q, now);
            q.addLast(now);
        }
    }

    private void prune(Deque<Instant> q, Instant now) {
        Instant cutoff = now.minus(window);
        while (!q.isEmpty() && !q.peekFirst().isAfter(cutoff)) {
            q.pollFirst();
        }
    }

    private void sweep(Instant now) {
        hits.entrySet().removeIf(e -> {
            synchronized (e.getValue()) {
                prune(e.getValue(), now);
                return e.getValue().isEmpty();
            }
        });
    }
}
