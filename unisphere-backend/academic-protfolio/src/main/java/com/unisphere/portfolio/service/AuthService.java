package com.unisphere.portfolio.service;

import com.unisphere.portfolio.dto.AdminLoginRequest;
import com.unisphere.portfolio.dto.AdminLoginResponse;

public interface AuthService {
    AdminLoginResponse adminLogin(AdminLoginRequest request);
}
