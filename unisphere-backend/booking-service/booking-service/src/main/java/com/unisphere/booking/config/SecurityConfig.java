package com.unisphere.booking.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // 1. CSRF Disable කිරීම (API එකක් නිසා)
                .csrf(csrf -> csrf.disable())

                // 2. CORS Configuration එක සම්බන්ධ කිරීම
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // 3. Request Authorization
                .authorizeHttpRequests(auth -> auth
                        // Browser එකෙන් එවන OPTIONS request වලට ඕනෑම වෙලාවක ඉඩ දීම (CORS Fix)
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        // දැනට ඔක්කොම API endpoints වලට ඉඩ දීලා තියෙන්නේ
                        .anyRequest().permitAll()
                )

                // 4. Session Management (Stateless - JWT පාවිච්චි කරන නිසා වැදගත්)
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )

                // 5. H2 Console හෝ Frames පාවිච්චි කරනවා නම් ඒවාට ඉඩ දීම
                .headers(headers -> headers
                        .frameOptions(frame -> frame.disable())
                );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        // Frontend එකේ URL ටික හරියටම තියෙනවාද බලන්න
        config.setAllowedOrigins(List.of("http://localhost:3000", "http://localhost:3001"));

        // ඉඩ දෙන Methods (OPTIONS එක අනිවාර්යයි)
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));

        // Header එකේ ඕනෑම දෙයක් එවන්න ඉඩ දීම (Authorization Header එක ඇතුළුව)
        config.setAllowedHeaders(List.of("*"));

        // Credentials (Cookies/Auth Headers) වලට ඉඩ දීම
        config.setAllowCredentials(true);

        // දත්ත එවද්දී Browser එකට access කරන්න පුළුවන් headers (Optional)
        config.setExposedHeaders(List.of("Authorization"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        // මුළු API එකටම මේ configuration එක apply කිරීම
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}