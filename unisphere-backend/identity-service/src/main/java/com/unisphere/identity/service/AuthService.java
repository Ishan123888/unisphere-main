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
        if (credential.getPassword() == null || credential.getPassword().isBlank()) {
            throw new RuntimeException("Password is required for registration!");
        }

        credential.setUsername(credential.getUsername().trim().toLowerCase());

        if (repository.findByUsername(credential.getUsername()).isPresent()) {
            throw new RuntimeException("Username '" + credential.getUsername() + "' is already registered!");
        }

        if (credential.getRole() == null || credential.getRole().isBlank()) {
            credential.setRole("STUDENT");
        }
        String role = credential.getRole().toUpperCase().trim();
        if (!role.equals("STUDENT") && !role.equals("TUTOR") && !role.equals("ADMIN")) {
            throw new RuntimeException("Invalid role: " + role);
        }
        credential.setRole(role);

        if (credential.getStatus() == null || credential.getStatus().isBlank()) {
            credential.setStatus(role.equals("TUTOR") ? "PENDING_REVIEW" : "ACTIVE");
        }

        if (credential.getSubjectsRaw() != null && !credential.getSubjectsRaw().isEmpty()) {
            credential.setSubjects(String.join(",", credential.getSubjectsRaw()));
            credential.setSubject(credential.getSubjectsRaw().get(0));
        }

        if (credential.getTagsRaw() != null && !credential.getTagsRaw().isEmpty()) {
            credential.setTags(String.join(",", credential.getTagsRaw()));
        }

        if (credential.getPreferredSubjectsRaw() != null && !credential.getPreferredSubjectsRaw().isEmpty()) {
            credential.setPreferredSubjects(String.join(",", credential.getPreferredSubjectsRaw()));
        }

        credential.setPassword(passwordEncoder.encode(credential.getPassword()));
        repository.save(credential);

        return role.equals("TUTOR")
                ? "Tutor profile submitted for review!"
                : "Student account created successfully!";
    }

    public AuthResponse generateToken(String username) {
        UserCredential user = repository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));

        if ("PENDING_REVIEW".equalsIgnoreCase(user.getStatus())) {
            throw new RuntimeException("Your tutor account is still under review.");
        }

        String token = jwtService.generateToken(username, user.getRole());

        return AuthResponse.builder()
                .token(token)
                .role(user.getRole())
                .id(user.getId()) // ✅ දැන් int නිසා error එක එන්නේ නැහැ
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