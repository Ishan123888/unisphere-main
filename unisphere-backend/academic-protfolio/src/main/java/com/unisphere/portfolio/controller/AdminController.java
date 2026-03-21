package com.unisphere.portfolio.controller;

import com.unisphere.portfolio.entity.Achievement;
import com.unisphere.portfolio.entity.Student;
import com.unisphere.portfolio.entity.StudentBadge;
import com.unisphere.portfolio.service.AdminService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/achievements/pending")
    public ResponseEntity<List<Achievement>> getPendingAchievements() {
        return ResponseEntity.ok(adminService.getPendingAchievements());
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
}