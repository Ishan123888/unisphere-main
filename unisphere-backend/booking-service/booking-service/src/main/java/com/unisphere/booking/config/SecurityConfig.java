package com.unisphere.booking.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Public endpoints
                        .requestMatchers(HttpMethod.GET,  "/api/bookings/stats").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/bookings").permitAll()
                        .requestMatchers(HttpMethod.GET,  "/api/bookings/**").permitAll()
                        .requestMatchers(HttpMethod.PUT,  "/api/bookings/**").permitAll()
                        // Tutor profile — public read
                        .requestMatchers(HttpMethod.GET,  "/api/tutors/**").permitAll()
                        // Admin & report endpoints — permit for now (add JWT later)
                        .requestMatchers("/api/reports/**").permitAll()
                        .anyRequest().authenticated()
                );

        return http.build();
    }
}