package com.unisphere.identity.service;

import com.unisphere.identity.dto.AuthResponse;
import com.unisphere.identity.entity.UserCredential;
import com.unisphere.identity.repository.UserCredentialRepository;
import io.jsonwebtoken.Jwts;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private UserCredentialRepository repository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    public String saveUser(UserCredential credential) {

        // ── Username — keep as SLIIT ID (it24100001), never override with email ──
        if (credential.getUsername() == null || credential.getUsername().isBlank()) {
            throw new RuntimeException("Username is required!");
        }
        // Normalize to lowercase
        credential.setUsername(credential.getUsername().trim().toLowerCase());

        // ── Duplicate username check ──────────────────────────────
        if (repository.findByUsername(credential.getUsername()).isPresent()) {
            throw new RuntimeException("Username '" + credential.getUsername() + "' is already registered!");
        }

        // ── Role validation ───────────────────────────────────────
        if (credential.getRole() == null || credential.getRole().isBlank()) {
            credential.setRole("STUDENT");
        }
        String role = credential.getRole().toUpperCase().trim();
        if (!role.equals("STUDENT") && !role.equals("TUTOR") && !role.equals("ADMIN")) {
            throw new RuntimeException("Invalid role: " + role);
        }
        credential.setRole(role);

        // ── Status: TUTOR → PENDING_REVIEW, STUDENT → ACTIVE ─────
        if (credential.getStatus() == null || credential.getStatus().isBlank()) {
            credential.setStatus(role.equals("TUTOR") ? "PENDING_REVIEW" : "ACTIVE");
        }

        // ── subjects[] → comma-separated String ──────────────────
        if (credential.getSubjectsRaw() != null && !credential.getSubjectsRaw().isEmpty()) {
            credential.setSubjects(String.join(",", credential.getSubjectsRaw()));
            credential.setSubject(credential.getSubjectsRaw().get(0));
        }

        // ── tags[] → comma-separated String ──────────────────────
        if (credential.getTagsRaw() != null && !credential.getTagsRaw().isEmpty()) {
            credential.setTags(String.join(",", credential.getTagsRaw()));
        }

        // ── preferredSubjects[] → comma-separated String ─────────
        if (credential.getPreferredSubjectsRaw() != null && !credential.getPreferredSubjectsRaw().isEmpty()) {
            credential.setPreferredSubjects(String.join(",", credential.getPreferredSubjectsRaw()));
        }

        // ── Encode password ───────────────────────────────────────
        credential.setPassword(passwordEncoder.encode(credential.getPassword()));

        repository.save(credential);

        System.out.println(">>> REGISTER SUCCESS | Username: " + credential.getUsername()
                + " | Role: " + role + " | Status: " + credential.getStatus());

        return role.equals("TUTOR")
                ? "Tutor profile submitted for review!"
                : "Student account created successfully!";
    }

    public AuthResponse generateToken(String username) {
        UserCredential user = repository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));

        // Block PENDING_REVIEW tutors from logging in
        if ("PENDING_REVIEW".equals(user.getStatus())) {
            throw new RuntimeException(
                    "Your tutor account is still under review. Please wait for admin approval.");
        }

        String token = jwtService.generateToken(username, user.getRole());

        return AuthResponse.builder()
                .token(token)
                .role(user.getRole())
                .build();
    }

    public void validateToken(final String token) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(jwtService.getSignKey())
                    .build()
                    .parseClaimsJws(token);
        } catch (Exception e) {
            throw new RuntimeException("Invalid or Expired Token!");
        }
    }
}