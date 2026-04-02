package com.unisphere.portfolio.controller;

import com.unisphere.portfolio.dto.SessionRequest;
import com.unisphere.portfolio.dto.SessionResponse;
import com.unisphere.portfolio.service.SessionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/sessions")
@CrossOrigin(origins = "*")
public class SessionController {
    
    @Autowired
    private SessionService sessionService;
    
    @PostMapping("/create")
    public ResponseEntity<Map<String, Object>> createSession(@RequestBody SessionRequest request) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Validate request
            if (request.getSessionName() == null || request.getSessionName().trim().isEmpty()) {
                response.put("success", false);
                response.put("error", "Session name is required");
                return ResponseEntity.badRequest().body(response);
            }
            
            if (request.getPrice() == null) {
                response.put("success", false);
                response.put("error", "Price is required");
                return ResponseEntity.badRequest().body(response);
            }
            
            if (request.getVideos() == null || request.getVideos().isEmpty()) {
                // Videos are optional - they will be added separately via "Add Session Videos"
                request.setVideos(new java.util.ArrayList<>());
            }
            
            SessionResponse sessionResponse = sessionService.createSession(request);
            
            response.put("success", true);
            response.put("message", "Session created successfully");
            response.put("data", sessionResponse);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getSession(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            SessionResponse sessionResponse = sessionService.getSessionById(id);
            
            response.put("success", true);
            response.put("data", sessionResponse);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }
    
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllSessions() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            List<SessionResponse> sessions = sessionService.getAllSessions();
            
            response.put("success", true);
            response.put("data", sessions);
            response.put("count", sessions.size());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateSession(@PathVariable Long id, @RequestBody SessionRequest request) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            SessionResponse sessionResponse = sessionService.updateSession(id, request);
            
            response.put("success", true);
            response.put("message", "Session updated successfully");
            response.put("data", sessionResponse);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteSession(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            sessionService.deleteSession(id);
            
            response.put("success", true);
            response.put("message", "Session deleted successfully");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}
