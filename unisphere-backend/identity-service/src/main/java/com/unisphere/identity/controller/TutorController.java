package com.unisphere.identity.controller;

import com.unisphere.identity.entity.UserCredential;
import com.unisphere.identity.repository.UserCredentialRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

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
        // Response එකේදී විතරක් password හංගනවා
        tutors.forEach(t -> t.setPassword(null));
        return ResponseEntity.ok(tutors);
    }

    // ── 2. Get approved (ACTIVE) tutors only ──────────────────────
    @GetMapping("/tutors/approved")
    public ResponseEntity<List<UserCredential>> getApprovedTutors() {
        List<UserCredential> tutors = repository.findByRoleAndStatus("TUTOR", "ACTIVE");
        tutors.forEach(t -> t.setPassword(null));
        return ResponseEntity.ok(tutors);
    }

    // ── 3. Get single tutor by ID ─────────────────────────────────
    @GetMapping("/tutors/{id}")
    public ResponseEntity<UserCredential> getTutorById(@PathVariable int id) {
        return repository.findById(id)
                .map(tutor -> {
                    tutor.setPassword(null); // හංගනවා
                    return ResponseEntity.ok(tutor);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // ── 4. APPROVE tutor — PENDING_REVIEW → ACTIVE ────────────────
    @PutMapping("/tutors/{id}/approve")
    public ResponseEntity<?> approveTutor(@PathVariable int id) {
        return repository.findById(id)
                .map(tutor -> {
                    if (!"TUTOR".equals(tutor.getRole())) {
                        return ResponseEntity.badRequest()
                                .body(Map.of("message", "User is not a tutor"));
                    }
                    if ("ACTIVE".equals(tutor.getStatus())) {
                        return ResponseEntity.badRequest()
                                .body(Map.of("message", "Tutor is already approved"));
                    }

                    // ✅ මම මෙතන තිබ්බ tutor.setPassword(null) අයින් කළා.
                    // එතකොට database එකේ password එක ආරක්ෂිතයි.
                    tutor.setStatus("ACTIVE");
                    UserCredential saved = repository.save(tutor);

                    saved.setPassword(null); // Save වුණාට පස්සේ විතරක් null කරලා යවනවා
                    return ResponseEntity.ok(saved);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // ── 5. REJECT tutor — PENDING_REVIEW → REJECTED ───────────────
    @PutMapping("/tutors/{id}/reject")
    public ResponseEntity<?> rejectTutor(@PathVariable int id) {
        return repository.findById(id)
                .map(tutor -> {
                    if (!"TUTOR".equals(tutor.getRole())) {
                        return ResponseEntity.badRequest()
                                .body(Map.of("message", "User is not a tutor"));
                    }

                    tutor.setStatus("REJECTED");
                    UserCredential saved = repository.save(tutor);

                    saved.setPassword(null);
                    return ResponseEntity.ok(saved);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // ── 6. Update tutor stats (booking-service calls this) ────────
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

                    // ✅ මෙතනත් repository.save() එකට කලින් තිබ්බ null කිරීම අයින් කළා.
                    UserCredential saved = repository.save(tutor);

                    saved.setPassword(null);
                    return ResponseEntity.ok(saved);
                })
                .orElse(ResponseEntity.notFound().build());
    }
}