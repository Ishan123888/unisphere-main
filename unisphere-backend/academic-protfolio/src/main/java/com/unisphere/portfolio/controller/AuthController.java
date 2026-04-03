package com.unisphere.portfolio.controller;

import com.unisphere.portfolio.dto.AdminLoginRequest;
import com.unisphere.portfolio.dto.AdminLoginResponse;
import com.unisphere.portfolio.entity.Student;
import com.unisphere.portfolio.repository.StudentRepository;
import com.unisphere.portfolio.service.AuthService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final StudentRepository studentRepository;

    public AuthController(AuthService authService, StudentRepository studentRepository) {
        this.authService = authService;
        this.studentRepository = studentRepository;
    }

    @PostMapping("/admin/login")
    public ResponseEntity<?> adminLogin(@RequestBody AdminLoginRequest request) {
        try {
            return ResponseEntity.ok(authService.adminLogin(request));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Invalid username or password"));
        }
    }

    // Called by frontend after identity-service login to resolve portfolio studentId by username
    @GetMapping("/student/resolve")
    public ResponseEntity<?> resolveStudent(
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String username,
            @RequestParam(required = false) String password) {

        Optional<Student> student = Optional.empty();

        // Try username first (most reliable)
        if (username != null && !username.isBlank()) {
            student = studentRepository.findByUsername(username.trim().toLowerCase());
        }
        // Fall back to email
        if (student.isEmpty() && email != null && !email.isBlank()) {
            student = studentRepository.findByEmail(email.trim());
        }

        if (student.isPresent()) {
            Student s = student.get();
            // If student has a password set, verify it (plain text)
            if (s.getPassword() != null && !s.getPassword().isBlank()) {
                if (password == null || !password.equals(s.getPassword())) {
                    return ResponseEntity.status(401)
                            .body(Map.of("error", "Invalid credentials"));
                }
            }
            return ResponseEntity.ok(Map.of(
                "studentId", s.getId(),
                "fullName",  s.getFullName() != null ? s.getFullName() : ""
            ));
        }
        return ResponseEntity.ok(Map.of("studentId", "", "fullName", ""));
    }
}
