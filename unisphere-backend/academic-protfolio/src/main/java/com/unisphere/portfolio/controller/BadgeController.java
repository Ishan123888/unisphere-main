package com.unisphere.portfolio.controller;

import com.unisphere.portfolio.dto.BadgeEarnedResponse;
import com.unisphere.portfolio.service.BadgeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/badges")
@CrossOrigin(origins = "*")
public class BadgeController {
    
    @Autowired
    private BadgeService badgeService;
    
    @PostMapping("/record-play")
    public ResponseEntity<Map<String, Object>> recordVideoPlay(
            @RequestParam Long studentId,
            @RequestParam Long sessionId,
            @RequestParam Long videoId
    ) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            BadgeEarnedResponse badgeResponse = badgeService.recordVideoPlay(studentId, sessionId, videoId);
            
            response.put("success", true);
            response.put("data", badgeResponse);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
    
    @GetMapping("/play-count/{studentId}/{sessionId}")
    public ResponseEntity<Map<String, Object>> getVideoPlayCount(
            @PathVariable Long studentId,
            @PathVariable Long sessionId
    ) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            Long playCount = badgeService.getVideoPlayCount(studentId, sessionId);
            
            response.put("success", true);
            response.put("playCount", playCount);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
    
    @GetMapping("/earned-badge/{studentId}/{sessionId}")
    public ResponseEntity<Map<String, Object>> getEarnedBadge(
            @PathVariable Long studentId,
            @PathVariable Long sessionId
    ) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            String badge = badgeService.getEarnedBadgeForSession(studentId, sessionId);
            
            response.put("success", true);
            response.put("badge", badge);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
}
