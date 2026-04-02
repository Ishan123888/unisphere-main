package com.unisphere.portfolio.controller;

import com.unisphere.portfolio.dto.SessionQuestionRequest;
import com.unisphere.portfolio.dto.SessionQuestionResponse;
import com.unisphere.portfolio.entity.Session;
import com.unisphere.portfolio.entity.SessionQuestion;
import com.unisphere.portfolio.entity.SessionQuizConfig;
import com.unisphere.portfolio.entity.Student;
import com.unisphere.portfolio.entity.StudentQuizResult;
import com.unisphere.portfolio.repository.SessionQuestionRepository;
import com.unisphere.portfolio.repository.SessionQuizConfigRepository;
import com.unisphere.portfolio.repository.SessionRepository;
import com.unisphere.portfolio.repository.StudentRepository;
import com.unisphere.portfolio.repository.StudentQuizResultRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/session-questions")
public class SessionQuestionController {

    private final SessionQuestionRepository questionRepo;
    private final SessionQuizConfigRepository quizConfigRepo;
    private final SessionRepository sessionRepo;
    private final StudentRepository studentRepo;
    private final StudentQuizResultRepository quizResultRepo;

    public SessionQuestionController(SessionQuestionRepository questionRepo,
                                     SessionQuizConfigRepository quizConfigRepo,
                                     SessionRepository sessionRepo,
                                     StudentRepository studentRepo,
                                     StudentQuizResultRepository quizResultRepo) {
        this.questionRepo = questionRepo;
        this.quizConfigRepo = quizConfigRepo;
        this.sessionRepo = sessionRepo;
        this.studentRepo = studentRepo;
        this.quizResultRepo = quizResultRepo;
    }

    // Add a question
    @PostMapping
    public ResponseEntity<SessionQuestionResponse> addQuestion(@RequestBody SessionQuestionRequest req) {
        Session session = sessionRepo.findById(req.getSessionId())
                .orElseThrow(() -> new RuntimeException("Session not found: " + req.getSessionId()));
        SessionQuestion q = new SessionQuestion(session, req.getQuestionText(),
                req.getOptionA(), req.getOptionB(), req.getOptionC(), req.getOptionD(), req.getCorrectAnswer());
        return ResponseEntity.ok(toResponse(questionRepo.save(q)));
    }

    // Get all questions for a session
    @GetMapping("/session/{sessionId}")
    public ResponseEntity<List<SessionQuestionResponse>> getQuestions(@PathVariable Long sessionId) {
        return ResponseEntity.ok(questionRepo.findBySessionId(sessionId)
                .stream().map(this::toResponse).collect(Collectors.toList()));
    }

    // Delete a question
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteQuestion(@PathVariable Long id) {
        questionRepo.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // Set/update time limit for a session quiz
    @PostMapping("/session/{sessionId}/time-limit")
    public ResponseEntity<Map<String, Object>> setTimeLimit(@PathVariable Long sessionId,
                                                             @RequestBody Map<String, Integer> body) {
        Session session = sessionRepo.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found: " + sessionId));
        Integer minutes = body.get("timeLimitMinutes");
        SessionQuizConfig config = quizConfigRepo.findBySessionId(sessionId)
                .orElse(new SessionQuizConfig(session, minutes));
        config.setTimeLimitMinutes(minutes);
        quizConfigRepo.save(config);
        return ResponseEntity.ok(Map.of("success", true, "timeLimitMinutes", minutes));
    }

    // Get time limit for a session
    @GetMapping("/session/{sessionId}/time-limit")
    public ResponseEntity<Map<String, Object>> getTimeLimit(@PathVariable Long sessionId) {
        return quizConfigRepo.findBySessionId(sessionId)
                .map(c -> ResponseEntity.ok(Map.of("timeLimitMinutes", (Object) c.getTimeLimitMinutes())))
                .orElse(ResponseEntity.ok(Map.of("timeLimitMinutes", (Object) 0)));
    }

    // Check if student has already attempted this session's quiz
    @GetMapping("/session/{sessionId}/student/{studentId}/attempt")
    public ResponseEntity<Map<String, Object>> checkAttempt(@PathVariable Long sessionId,
                                                             @PathVariable Long studentId) {
        boolean attempted = quizResultRepo.existsByStudentIdAndSessionId(studentId, sessionId);
        if (attempted) {
            StudentQuizResult result = quizResultRepo.findByStudentIdAndSessionId(studentId, sessionId).get();
            return ResponseEntity.ok(Map.of(
                "attempted", true,
                "score", result.getScore(),
                "totalQuestions", result.getTotalQuestions(),
                "percentage", result.getPercentage(),
                "passed", result.getPassed(),
                "completedAt", result.getCompletedAt().toString()
            ));
        }
        return ResponseEntity.ok(Map.of("attempted", false));
    }

    // Submit quiz result
    @PostMapping("/session/{sessionId}/student/{studentId}/submit")
    public ResponseEntity<Map<String, Object>> submitQuiz(@PathVariable Long sessionId,
                                                           @PathVariable Long studentId,
                                                           @RequestBody Map<String, Integer> body) {
        // Prevent re-attempt
        if (quizResultRepo.existsByStudentIdAndSessionId(studentId, sessionId)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Quiz already attempted"));
        }

        Session session = sessionRepo.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));
        Student student = studentRepo.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        int score = body.getOrDefault("score", 0);
        int total = body.getOrDefault("totalQuestions", 0);

        StudentQuizResult result = new StudentQuizResult(student, session, score, total);
        quizResultRepo.save(result);

        return ResponseEntity.ok(Map.of(
            "success", true,
            "score", result.getScore(),
            "totalQuestions", result.getTotalQuestions(),
            "percentage", result.getPercentage(),
            "passed", result.getPassed()
        ));
    }

    // Get all quiz results for a student
    @GetMapping("/student/{studentId}/results")
    public ResponseEntity<List<Map<String, Object>>> getStudentResults(@PathVariable Long studentId) {
        return ResponseEntity.ok(
            quizResultRepo.findByStudentId(studentId).stream().map(r -> {
                java.util.Map<String, Object> m = new java.util.HashMap<>();
                m.put("id", r.getId());
                m.put("sessionId", r.getSession().getId());
                m.put("sessionName", r.getSession().getSessionName());
                m.put("score", r.getScore());
                m.put("totalQuestions", r.getTotalQuestions());
                m.put("percentage", r.getPercentage());
                m.put("passed", r.getPassed());
                m.put("completedAt", r.getCompletedAt().toString());
                return m;
            }).collect(java.util.stream.Collectors.toList())
        );
    }

    private SessionQuestionResponse toResponse(SessionQuestion q) {
        return new SessionQuestionResponse(q.getId(), q.getSession().getId(), q.getQuestionText(),
                q.getOptionA(), q.getOptionB(), q.getOptionC(), q.getOptionD(),
                q.getCorrectAnswer(), q.getCreatedAt());
    }
}
