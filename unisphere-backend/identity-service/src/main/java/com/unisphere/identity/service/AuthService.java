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
        // ✅ Fix 1: Username duplicate check
        if (repository.findByUsername(credential.getUsername()).isPresent()) {
            throw new RuntimeException("Username '" + credential.getUsername() + "' දැනටමත් register වෙලා තිබෙනවා!");
        }

        // ✅ Fix 2: Role null නම් default STUDENT set කිරීම
        if (credential.getRole() == null || credential.getRole().isBlank()) {
            credential.setRole("STUDENT");
        }

        // ✅ Fix 3: Valid roles පමණක් allow කිරීම
        String role = credential.getRole().toUpperCase().trim();
        if (!role.equals("STUDENT") && !role.equals("TUTOR") && !role.equals("ADMIN")) {
            throw new RuntimeException("Invalid role: " + role);
        }
        credential.setRole(role);

        credential.setPassword(passwordEncoder.encode(credential.getPassword()));
        repository.save(credential);
        return "Member සාර්ථකව පද්ධතියට එක් කරන ලදී!";
    }

    public AuthResponse generateToken(String username) {
        UserCredential user = repository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));

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