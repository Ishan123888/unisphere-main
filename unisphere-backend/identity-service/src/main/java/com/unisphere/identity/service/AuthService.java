package com.unisphere.identity.service;

import com.unisphere.identity.dto.AuthResponse;
import com.unisphere.identity.entity.UserCredential;
import com.unisphere.identity.repository.UserCredentialRepository;
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
        credential.setPassword(passwordEncoder.encode(credential.getPassword()));
        repository.save(credential);
        return "Member සාර්ථකව පද්ධතියට එක් කරන ලදී!";
    }

    // මෙන්න මේ මෙතඩ් එක තමයි Controller එකෙන් කෝල් කරන්නේ
    public AuthResponse generateToken(String username) {
        UserCredential user = repository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Token එක හදනවා
        String token = jwtService.generateToken(username, user.getRole());

        // Token එකයි Role එකයි දෙකම අඩංගු AuthResponse එකක් return කරනවා
        return AuthResponse.builder()
                .token(token)
                .role(user.getRole())
                .build();
    }
}