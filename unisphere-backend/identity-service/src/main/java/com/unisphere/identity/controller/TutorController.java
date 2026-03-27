package com.unisphere.identity.controller;

import com.unisphere.identity.entity.UserCredential;
import com.unisphere.identity.repository.UserCredentialRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class TutorController {

    @Autowired
    private UserCredentialRepository repository;

    // ── 1. Get all tutors ─────────────────────────────────────────
    @GetMapping("/tutors")
    public ResponseEntity<List<UserCredential>> getAllTutors() {
        List<UserCredential> tutors = repository.findByRole("TUTOR");
        tutors.forEach(t -> t.setPassword(null));
        return ResponseEntity.ok(tutors);
    }

    // ── 2. Get approved (ACTIVE) tutors ───────────────────────────
    @GetMapping("/tutors/approved")
    public ResponseEntity<List<UserCredential>> getApprovedTutors() {
        List<UserCredential> tutors = repository.findByRoleAndStatus("TUTOR", "ACTIVE");
        tutors.forEach(t -> t.setPassword(null));
        return ResponseEntity.ok(tutors);
    }

    // ── 3. Get single tutor by ID ─────────────────────────────────
    //    Explorer එකෙන් /tutor-booking/{id} click කළාම මේකෙන් data එනවා
    @GetMapping("/tutors/{id}")
    public ResponseEntity<UserCredential> getTutorById(@PathVariable int id) {
        return repository.findById(id)
                .map(tutor -> {
                    tutor.setPassword(null); // password hide කරනවා
                    return ResponseEntity.ok(tutor);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // ── 4. Update tutor stats (booking-service calls this) ────────
    @PutMapping("/tutors/{id}/stats")
    public ResponseEntity<UserCredential> updateTutorStats(
            @PathVariable int id,
            @RequestParam(required = false) Integer sessions,
            @RequestParam(required = false) Double rating,
            @RequestParam(required = false) Integer reviews) {

        return repository.findById(id)
                .map(tutor -> {
                    if (sessions != null) tutor.setSessions(sessions);
                    if (rating   != null) tutor.setRating(rating);
                    if (reviews  != null) tutor.setReviews(reviews);
                    tutor.setPassword(null);
                    return ResponseEntity.ok(repository.save(tutor));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}