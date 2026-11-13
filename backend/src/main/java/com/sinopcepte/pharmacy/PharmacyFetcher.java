package com.sinopcepte.pharmacy;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;

import org.springframework.stereotype.Component;

/** Kaynak sayfayı indirir. Yalnız {@link PharmacyService} çağırır; o da {@code fetch-enabled} bayrağına bakar. */
@Component
public class PharmacyFetcher {

    private final PharmacyProperties props;
    private final HttpClient client;

    public PharmacyFetcher(PharmacyProperties props) {
        this.props = props;
        this.client = HttpClient.newBuilder()
                .connectTimeout(props.timeout())
                .followRedirects(HttpClient.Redirect.NORMAL)
                .build();
    }

    public String fetch() throws IOException, InterruptedException {
        HttpRequest req = HttpRequest.newBuilder(URI.create(props.url()))
                .timeout(props.timeout())
                .header("User-Agent", props.userAgent())
                .header("Accept", "text/html")
                .GET()
                .build();
        HttpResponse<String> res = client.send(req, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
        if (res.statusCode() != 200) {
            throw new IOException("Beklenmeyen HTTP durumu: " + res.statusCode());
        }
        return res.body();
    }
}
