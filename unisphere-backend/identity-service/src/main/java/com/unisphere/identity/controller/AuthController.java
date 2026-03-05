package com.unisphere.identity.controller;

import com.unisphere.identity.dto.AuthResponse;
import com.unisphere.identity.entity.UserCredential;
import com.unisphere.identity.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*") // Frontend එකට සම්බන්ධ වීමට අනිවාර්යයෙන්ම අවශ්‍යයි
public class AuthController {

    @Autowired
    private AuthService service;

    @Autowired
    private AuthenticationManager authenticationManager;

    /**
     * අලුත් සාමාජිකයෙක් ලියාපදිංචි කිරීම
     */
    @PostMapping("/register")
    public String addNewUser(@RequestBody UserCredential user) {
        return service.saveUser(user);
    }

    /**
     * ලොග් වූ පසු Token එක සහ Role එක ලබාදීම
     */
    @PostMapping("/login")
    public AuthResponse getToken(@RequestBody UserCredential user) {
        // 1. Username සහ Password පරීක්ෂා කිරීම
        Authentication authenticate = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(user.getUsername(), user.getPassword())
        );

        if (authenticate.isAuthenticated()) {
            // 2. Token එක සහ Role එක අඩංගු AuthResponse ලබා ගැනීම
            return service.generateToken(user.getUsername());
        } else {
            throw new RuntimeException("පද්ධතියට ඇතුළු වීමට අවසර නැත (Invalid Access)");
        }
    }

    /**
     * Token එක Valid ද කියා පරීක්ෂා කිරීම (Optional - Gateway එකට අවශ්‍ය වේ)
     */
    @GetMapping("/validate")
    public String validateToken(@RequestParam("token") String token) {
        service.validateToken(token);
        return "Token is valid";
    }
}