package com.sinopcepte.confession;

import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

public final class SinopAliasGenerator {

    private SinopAliasGenerator() {}

    private record Theme(String prefix, String avatar) {}

    private static final List<Theme> THEMES = List.of(
            new Theme("Gizli Martı", "marti"),
            new Theme("Hamsi Dedektifi", "hamsi"),
            new Theme("Kordon Gölgesi", "fener"),
            new Theme("İskele Bekçisi", "yelkenli"),
            new Theme("Karakum Rüzgarı", "denizkabugu"),
            new Theme("Fener Muhafızı", "fener"),
            new Theme("Cezaevi Firarisi", "kale"),
            new Theme("Ada Boğazı Gezgini", "yunus"),
            new Theme("Akliman Sırrı", "denizkabugu"),
            new Theme("Hamsilos Fısıltısı", "yelkenli")
    );

    public record GeneratedAlias(String name, String avatar) {}

    public static GeneratedAlias generate(String preferredTheme) {
        int num = ThreadLocalRandom.current().nextInt(10, 999);
        if (preferredTheme != null && !preferredTheme.isBlank()) {
            for (Theme t : THEMES) {
                if (t.prefix().toLowerCase().contains(preferredTheme.toLowerCase())) {
                    return new GeneratedAlias(t.prefix() + " #" + num, t.avatar());
                }
            }
        }
        Theme chosen = THEMES.get(ThreadLocalRandom.current().nextInt(THEMES.size()));
        return new GeneratedAlias(chosen.prefix() + " #" + num, chosen.avatar());
    }
}
