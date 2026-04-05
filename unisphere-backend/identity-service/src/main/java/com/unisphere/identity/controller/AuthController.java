package com.unisphere.identity.controller;

import com.unisphere.identity.dto.AuthResponse;
import com.unisphere.identity.entity.UserCredential;
import com.unisphere.identity.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private AuthService service;

    @Autowired
    private AuthenticationManager authenticationManager;

    @PostMapping("/register")
    public ResponseEntity<?> addNewUser(@RequestBody UserCredential user) {
        try {
            System.out.println(">>> REGISTER REQUEST | Username: " + user.getUsername());
            String result = service.saveUser(user);
            return ResponseEntity.ok(Map.of("message", result));
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> getToken(@RequestBody UserCredential user) {
        try {
            System.out.println(">>> LOGIN REQUEST | Username: " + user.getUsername());

            Authentication authenticate = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(user.getUsername(), user.getPassword())
            );

            if (authenticate.isAuthenticated()) {
                // මෙතනදී දැන් ID එකත් සහිතව response එක ලැබෙනවා ✅
                AuthResponse response = service.generateToken(user.getUsername());
                System.out.println(">>> LOGIN SUCCESS | ID: " + response.getId() + " | Role: " + response.getRole());
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity
                        .status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "Invalid credentials!"));
            }

        } catch (BadCredentialsException e) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Username හෝ Password වැරදියි!"));
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/validate")
    public ResponseEntity<?> validateToken(@RequestParam("token") String token) {
        try {
            service.validateToken(token);
            return ResponseEntity.ok(Map.of("message", "Token is valid"));
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Invalid or Expired Token!"));
        }
    }
}