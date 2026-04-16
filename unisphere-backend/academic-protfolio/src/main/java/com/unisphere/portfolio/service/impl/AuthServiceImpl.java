package com.unisphere.portfolio.service.impl;

import com.unisphere.portfolio.dto.AdminLoginRequest;
import com.unisphere.portfolio.dto.AdminLoginResponse;
import com.unisphere.portfolio.entity.Admin;
import com.unisphere.portfolio.repository.AdminRepository;
import com.unisphere.portfolio.service.AuthService;
import org.springframework.stereotype.Service;

@Service
public class AuthServiceImpl implements AuthService {

    private final AdminRepository adminRepository;

    public AuthServiceImpl(AdminRepository adminRepository) {
        this.adminRepository = adminRepository;
    }

    @Override
    public AdminLoginResponse adminLogin(AdminLoginRequest request) {
        Admin admin = adminRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("Admin not found"));

        if (!admin.getPassword().equals(request.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        return new AdminLoginResponse(
                admin.getId(),
                admin.getUsername(),
                admin.getFullName(),
                admin.getEmail(),
                admin.getPhoneNumber(),
                admin.getProfilePictureUrl(),
                "Login successful"
        );
    }
}
