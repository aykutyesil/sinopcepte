package com.sinopcepte.auth;

/**
 * Hesap silinmeden hemen önce, <b>aynı transaction içinde</b> ve eşzamanlı yayımlanır
 * ({@code DELETE /api/me}). Sonraki modüller ({@code @EventListener} ile) kendi verilerini burada
 * temizler ya da anonimleştirir; dinleyici exception fırlatırsa silme geri alınır.
 *
 * <p>Önerilen yaklaşım (README, "Hesap silme"): kişisel iz taşıyan satırlar (check-in) FK
 * {@code on delete cascade} ile silinir; başkalarının da gördüğü içerik (itiraf, ilan) FK
 * {@code on delete set null} ile sahipsiz bırakılır veya bu olayda anonimleştirilir.
 *
 * @param userId silinen {@code app_user.id}
 * @param handle silinen rumuz (silmeden sonra başkası alabilir; kalıcı referans olarak kullanılmamalı)
 */
public record UserDeletionEvent(Long userId, String handle) {
}
