package com.unisphere.portfolio.service;

import com.unisphere.portfolio.dto.AdminLoginRequest;
import com.unisphere.portfolio.dto.AdminLoginResponse;
import com.unisphere.portfolio.entity.Admin;
import com.unisphere.portfolio.repository.AdminRepository;
import com.unisphere.portfolio.service.impl.AuthServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AuthService Tests")
class AuthServiceImplTest {

    @Mock
    private AdminRepository adminRepository;

    @InjectMocks
    private AuthServiceImpl authService;

    private Admin admin;

    @BeforeEach
    void setUp() {
        admin = new Admin();
        admin.setId(1L);
        admin.setUsername("admin");
        admin.setPassword("admin123");
        admin.setFullName("System Administrator");
        admin.setEmail("admin@unisphere.lk");
    }

    @Test
    @DisplayName("Admin login succeeds with valid credentials")
    void adminLogin_validCredentials_returnsResponse() {
        when(adminRepository.findByUsername("admin")).thenReturn(Optional.of(admin));

        AdminLoginRequest request = new AdminLoginRequest();
        request.setUsername("admin");
        request.setPassword("admin123");

        AdminLoginResponse response = authService.adminLogin(request);

        assertNotNull(response);
        assertEquals("admin", response.getUsername());
        assertEquals("System Administrator", response.getFullName());
        verify(adminRepository, times(1)).findByUsername("admin");
    }

    @Test
    @DisplayName("Admin login fails with wrong password")
    void adminLogin_wrongPassword_throwsException() {
        when(adminRepository.findByUsername("admin")).thenReturn(Optional.of(admin));

        AdminLoginRequest request = new AdminLoginRequest();
        request.setUsername("admin");
        request.setPassword("wrongpassword");

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> authService.adminLogin(request));
        assertEquals("Invalid credentials", ex.getMessage());
    }

    @Test
    @DisplayName("Admin login fails when admin not found")
    void adminLogin_adminNotFound_throwsException() {
        when(adminRepository.findByUsername("unknown")).thenReturn(Optional.empty());

        AdminLoginRequest request = new AdminLoginRequest();
        request.setUsername("unknown");
        request.setPassword("any");

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> authService.adminLogin(request));
        assertEquals("Admin not found", ex.getMessage());
    }
}
