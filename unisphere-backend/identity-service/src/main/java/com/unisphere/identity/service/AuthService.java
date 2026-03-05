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

    /**
     * අලුත් සාමාජිකයෙක් සේව් කිරීම (BCrypt hashing සමඟ)
     */
    public String saveUser(UserCredential credential) {
        credential.setPassword(passwordEncoder.encode(credential.getPassword()));
        repository.save(credential);
        return "Member සාර්ථකව පද්ධතියට එක් කරන ලදී!";
    }

    /**
     * සාර්ථකව ලොග් වූ පසු Token එක සහ Role එක ලබාදීම
     */
    public AuthResponse generateToken(String username) {
        UserCredential user = repository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found with username: " + username));

        // JwtService එකේ generateToken(String username, String role) ලෙස තිබිය යුතුය
        String token = jwtService.generateToken(username, user.getRole());

        return AuthResponse.builder()
                .token(token)
                .role(user.getRole())
                .build();
    }

    /**
     * Token එක වලංගු ද කියා පරීක්ෂා කිරීම (Gateway/Internal validation)
     */
    public void validateToken(final String token) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(jwtService.getSignKey()) // පරීක්ෂා කරන්න: JwtService හි getSignKey() public ද කියා
                    .build()
                    .parseClaimsJws(token);
        } catch (Exception e) {
            throw new RuntimeException("Invalid or Expired Token!");
        }
    }
}