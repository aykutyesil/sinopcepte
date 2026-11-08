package com.sinopcepte;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

/**
 * Tarayıcı gibi davranan küçük test istemcisi: Set-Cookie başlıklarını kendi çerez kavanozunda tutar,
 * sonraki isteklere Cookie olarak ekler. Yönlendirme takip etmez (401 yerine redirect gelirse görülsün).
 *
 * <p>Her istemci kendine ait bir {@code X-Forwarded-For} IP'siyle gelir (vekil arkasındaki ayrı bir tarayıcı
 * gibi). Böylece IP başına hız sınırı sayaçları testler arasında karışmaz.
 */
public final class TestHttp {

    public record Res(int status, String body, HttpResponse<String> raw) {

        public JsonNode json() {
            return JSON.readTree(body);
        }

        public List<String> setCookies() {
            return raw.headers().allValues("set-cookie");
        }

        /** Belirli bir çerez için son Set-Cookie satırı (yoksa null). */
        public String setCookie(String name) {
            String found = null;
            for (String c : setCookies()) {
                if (c.startsWith(name + "=")) {
                    found = c;
                }
            }
            return found;
        }
    }

    private static final JsonMapper JSON = JsonMapper.builder().build();
    private static final AtomicInteger NEXT_IP = new AtomicInteger(1);

    private final String base;
    private final HttpClient client = HttpClient.newBuilder()
            .followRedirects(HttpClient.Redirect.NEVER)
            .connectTimeout(Duration.ofSeconds(10))
            .build();
    private final Map<String, String> cookies = new LinkedHashMap<>();
    private final String ip;

    public TestHttp(String base) {
        this(base, nextIp());
    }

    /** {@code ip}: bu istemcinin X-Forwarded-For değeri; null ise başlık gönderilmez. */
    public TestHttp(String base, String ip) {
        this.base = base;
        this.ip = ip;
    }

    /** 10.x.y.z biçiminde, süreç içinde tekil bir IP. */
    public static String nextIp() {
        int n = NEXT_IP.getAndIncrement();
        // 198.18.0.0/15 (RFC 2544, kamuya yönlendirilmez ama "özel ağ" da sayılmaz): Tomcat RemoteIpValve
        // bunu gerçek istemci olarak görür. 10.x olsaydı iç vekil sayılıp atlanırdı.
        return "198." + (18 + ((n >> 16) & 1)) + "." + ((n >> 8) & 0xff) + "." + (n & 0xff);
    }

    public String ip() {
        return ip;
    }

    public String cookie(String name) {
        return cookies.get(name);
    }

    public Res get(String path) {
        return send("GET", path, null, null);
    }

    public Res send(String method, String path, String jsonBody, String csrfHeader) {
        HttpRequest.Builder b = HttpRequest.newBuilder(URI.create(base + path)).timeout(Duration.ofSeconds(30));
        b.header("Accept", "application/json");
        if (ip != null) {
            b.header("X-Forwarded-For", ip);
        }
        if (jsonBody != null) {
            b.header("Content-Type", "application/json");
        }
        if (csrfHeader != null) {
            b.header("X-XSRF-TOKEN", csrfHeader);
        }
        if (!cookies.isEmpty()) {
            b.header("Cookie", cookies.entrySet().stream()
                    .map(e -> e.getKey() + "=" + e.getValue())
                    .collect(Collectors.joining("; ")));
        }
        b.method(method, jsonBody == null ? HttpRequest.BodyPublishers.noBody()
                : HttpRequest.BodyPublishers.ofString(jsonBody, StandardCharsets.UTF_8));
        try {
            HttpResponse<String> r = client.send(b.build(), HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
            absorbCookies(r);
            return new Res(r.statusCode(), r.body(), r);
        } catch (IOException e) {
            throw new RuntimeException(e);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException(e);
        }
    }

    /** Mevcut XSRF-TOKEN çerezini başlık olarak gönderir (SPA istemcisinin yaptığı gibi). */
    public Res sendWithCsrf(String method, String path, String jsonBody) {
        return send(method, path, jsonBody, cookies.get("XSRF-TOKEN"));
    }

    private void absorbCookies(HttpResponse<String> r) {
        for (String header : r.headers().allValues("set-cookie")) {
            String first = header.split(";", 2)[0];
            int eq = first.indexOf('=');
            if (eq <= 0) {
                continue;
            }
            String name = first.substring(0, eq).trim();
            String value = first.substring(eq + 1).trim();
            String lower = header.toLowerCase();
            boolean expired = lower.contains("max-age=0") || lower.contains("expires=thu, 01 jan 1970") || value.isEmpty();
            if (expired) {
                cookies.remove(name);
            } else {
                cookies.put(name, value);
            }
        }
    }
}
