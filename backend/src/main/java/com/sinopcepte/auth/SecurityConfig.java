package com.sinopcepte.auth;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.session.ChangeSessionIdAuthenticationStrategy;
import org.springframework.security.web.authentication.session.CompositeSessionAuthenticationStrategy;
import org.springframework.security.web.authentication.session.SessionAuthenticationStrategy;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfAuthenticationStrategy;
import org.springframework.security.web.savedrequest.NullRequestCache;

import java.util.List;

/**
 * Oturum çerezi (HttpOnly, SameSite=Lax) + çerez tabanlı CSRF.
 *
 * <p>CSRF: {@code CookieCsrfTokenRepository.withHttpOnlyFalse()} → çerez {@code XSRF-TOKEN},
 * başlık {@code X-XSRF-TOKEN}. Spring Security referansındaki SPA önerisi {@code csrf.spa()} ile
 * uygulanır: başlıktaki ham çerez değeri kabul edilir (JS istemcisi XOR maskesiyle uğraşmaz),
 * sunucu tarafından render edilen form parametreleri için BREACH koruması (XOR) korunur.
 */
@Configuration(proxyBeanMethods = false)
public class SecurityConfig {

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    AuthenticationManager authenticationManager(DbUserDetailsService uds, PasswordEncoder encoder) {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider(uds);
        provider.setPasswordEncoder(encoder);
        return new ProviderManager(provider);
    }

    @Bean
    CookieCsrfTokenRepository csrfTokenRepository(@Value("${app.cookies.secure:false}") boolean secure) {
        CookieCsrfTokenRepository repo = CookieCsrfTokenRepository.withHttpOnlyFalse();
        repo.setCookieCustomizer(c -> c.sameSite("Lax").secure(secure));
        return repo;
    }

    @Bean
    SecurityContextRepository securityContextRepository() {
        return new HttpSessionSecurityContextRepository();
    }

    /** JSON giriş denetleyicisinde elle uygulanır: oturum kimliğini değiştir + CSRF token'ını yenile. */
    @Bean
    SessionAuthenticationStrategy loginSessionStrategy(CookieCsrfTokenRepository csrfTokenRepository) {
        return new CompositeSessionAuthenticationStrategy(List.of(
                new ChangeSessionIdAuthenticationStrategy(),
                new CsrfAuthenticationStrategy(csrfTokenRepository)));
    }

    @Bean
    SecurityFilterChain apiSecurity(HttpSecurity http, CookieCsrfTokenRepository csrfTokenRepository,
                                    SecurityContextRepository securityContextRepository) throws Exception {
        JsonSecurityHandlers handlers = new JsonSecurityHandlers();
        http
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.GET, "/api/items", "/api/events", "/api/pharmacy/today",
                                "/api/auth/csrf").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/auth/login", "/api/auth/register").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/users/**").permitAll()
                        .requestMatchers("/api/me", "/api/me/**").authenticated()
                        .requestMatchers("/actuator/health", "/actuator/health/**").permitAll()
                        .requestMatchers("/error").permitAll()
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        .anyRequest().authenticated())
                .csrf(csrf -> csrf
                        .spa()
                        // spa() da withHttpOnlyFalse() kullanır; SameSite/Secure ayarlı aynı depo ile değiştiriyoruz.
                        .csrfTokenRepository(csrfTokenRepository))
                .securityContext(ctx -> ctx.securityContextRepository(securityContextRepository))
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED))
                .requestCache(rc -> rc.requestCache(new NullRequestCache()))
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint(handlers)
                        .accessDeniedHandler(handlers))
                .formLogin(AbstractHttpConfigurer::disable)
                .httpBasic(AbstractHttpConfigurer::disable)
                .logout(AbstractHttpConfigurer::disable);
        return http.build();
    }
}
