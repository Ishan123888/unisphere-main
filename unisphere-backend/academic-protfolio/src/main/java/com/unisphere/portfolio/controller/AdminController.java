package com.unisphere.portfolio.controller;

import com.unisphere.portfolio.dto.AdminCreateRequest;
import com.unisphere.portfolio.dto.AdminProfileUpdateRequest;
import com.unisphere.portfolio.dto.AdminResponse;
import com.unisphere.portfolio.entity.Achievement;
import com.unisphere.portfolio.entity.Student;
import com.unisphere.portfolio.entity.StudentBadge;
import com.unisphere.portfolio.repository.StudentRepository;
import com.unisphere.portfolio.service.AdminService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;
    private final StudentRepository studentRepository;

    public AdminController(AdminService adminService, StudentRepository studentRepository) {
        this.adminService = adminService;
        this.studentRepository = studentRepository;
    }

    @GetMapping("/achievements/pending")
    public ResponseEntity<List<Achievement>> getPendingAchievements() {
        return ResponseEntity.ok(adminService.getPendingAchievements());
    }

    @GetMapping("/achievements")
    public ResponseEntity<List<Achievement>> getAllAchievements() {
        return ResponseEntity.ok(adminService.getAllAchievements());
    }

    @PutMapping("/achievements/{id}/approve")
    public ResponseEntity<Achievement> approveAchievement(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> request
    ) {
        String comment = request != null
                ? request.getOrDefault("adminComment", "Approved by admin")
                : "Approved by admin";

        return ResponseEntity.ok(adminService.approveAchievement(id, comment));
    }

    @PutMapping("/achievements/{id}/reject")
    public ResponseEntity<Achievement> rejectAchievement(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> request
    ) {
        String comment = request != null
                ? request.getOrDefault("adminComment", "Rejected by admin")
                : "Rejected by admin";

        return ResponseEntity.ok(adminService.rejectAchievement(id, comment));
    }

    @GetMapping("/students/{studentId}/badges")
    public ResponseEntity<List<StudentBadge>> getStudentBadges(@PathVariable Long studentId) {
        return ResponseEntity.ok(adminService.getStudentBadges(studentId));
    }

    @PutMapping("/students/{studentId}/suspend")
    public ResponseEntity<Student> suspendStudent(@PathVariable Long studentId) {
        return ResponseEntity.ok(adminService.suspendStudent(studentId));
    }

    @GetMapping("/students")
    public ResponseEntity<List<Student>> getAllStudents() {
        return ResponseEntity.ok(adminService.getAllStudents());
    }

    @GetMapping("/students/{studentId}")
    public ResponseEntity<Student> getStudentById(@PathVariable Long studentId) {
        return studentRepository.findById(studentId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/profile/{adminId}")
    public ResponseEntity<AdminResponse> getAdminProfile(@PathVariable Long adminId) {
        return ResponseEntity.ok(adminService.getAdminProfile(adminId));
    }

    @PutMapping("/profile/{adminId}")
    public ResponseEntity<AdminResponse> updateAdminProfile(
            @PathVariable Long adminId,
            @RequestBody AdminProfileUpdateRequest request
    ) {
        return ResponseEntity.ok(adminService.updateAdminProfile(adminId, request));
    }

    @PostMapping("/create")
    public ResponseEntity<AdminResponse> createAdmin(@RequestBody AdminCreateRequest request) {
        return ResponseEntity.ok(adminService.createAdmin(request));
    }
}