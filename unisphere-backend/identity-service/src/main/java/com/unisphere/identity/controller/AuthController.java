package com.unisphere.identity.controller;

import com.unisphere.identity.dto.AuthResponse; // අපි හදපු DTO එක import කරන්න
import com.unisphere.identity.entity.UserCredential;
import com.unisphere.identity.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
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
     * සාර්ථකව ලොග් වූ පසු Token එක සහ Role එක ලබාදීම (Role-Based Access)
     */
    @PostMapping("/login")
    public AuthResponse getToken(@RequestBody UserCredential user) {
        // 1. Password එක සහ Username එක ඇත්තටම නිවැරදිද කියා පරීක්ෂා කිරීම
        Authentication authenticate = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(user.getUsername(), user.getPassword())
        );

        if (authenticate.isAuthenticated()) {
            // 2. දැන් අපේ AuthService එක හරහා Token එක සහ Role එක අඩංගු Object එක ලබාගන්නවා
            return service.generateToken(user.getUsername());
        } else {
            throw new RuntimeException("පද්ධතියට ඇතුළු වීමට අවසර නැත (Invalid Access)");
        }
    }
}