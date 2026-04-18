package com.unisphere.portfolio.service;

import com.unisphere.portfolio.entity.*;
import com.unisphere.portfolio.repository.AchievementRepository;
import com.unisphere.portfolio.repository.StudentRepository;
import com.unisphere.portfolio.service.impl.AchievementServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AchievementService Tests")
class AchievementServiceImplTest {

    @Mock
    private AchievementRepository achievementRepository;

    @Mock
    private StudentRepository studentRepository;

    @Mock
    private FileStorageService fileStorageService;

    @InjectMocks
    private AchievementServiceImpl achievementService;

    private Student student;
    private Achievement achievement;

    @BeforeEach
    void setUp() {
        student = new Student();
        student.setId(1L);
        student.setUsername("it24100001");
        student.setFullName("Demo Student");
        student.setStatus(UserStatus.ACTIVE);

        achievement = new Achievement();
        achievement.setId(1L);
        achievement.setStudent(student);
        achievement.setTitle("Best Project Award");
        achievement.setCategory("Academic");
        achievement.setDescription("Won best project at SLIIT");
        achievement.setInstitution("SLIIT");
        achievement.setLevel("University");
        achievement.setAchievementDate(LocalDate.of(2026, 1, 15));
        achievement.setStatus(AchievementStatus.PENDING);
        achievement.setCreatedAt(LocalDateTime.now());
        achievement.setUpdatedAt(LocalDateTime.now());
    }

    @Test
    @DisplayName("Create achievement successfully for active student")
    void createAchievement_activeStudent_success() {
        MockMultipartFile file = new MockMultipartFile(
                "file", "cert.pdf", "application/pdf", "content".getBytes());

        when(studentRepository.findById(1L)).thenReturn(Optional.of(student));
        when(fileStorageService.storeFile(file)).thenReturn("/uploads/cert.pdf");
        when(achievementRepository.save(any(Achievement.class))).thenReturn(achievement);

        Achievement result = achievementService.createAchievement(
                1L, "Best Project Award", "Academic", "Won best project at SLIIT",
                "SLIIT", "University", "2026-01-15", file);

        assertNotNull(result);
        assertEquals("Best Project Award", result.getTitle());
        assertEquals(AchievementStatus.PENDING, result.getStatus());
        verify(achievementRepository, times(1)).save(any(Achievement.class));
    }

    @Test
    @DisplayName("Create achievement fails for suspended student")
    void createAchievement_suspendedStudent_throwsException() {
        student.setStatus(UserStatus.SUSPENDED);
        when(studentRepository.findById(1L)).thenReturn(Optional.of(student));

        MockMultipartFile file = new MockMultipartFile(
                "file", "cert.pdf", "application/pdf", "content".getBytes());

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> achievementService.createAchievement(
                        1L, "Title", "Category", "Description",
                        "SLIIT", "University", "2026-01-15", file));

        assertEquals("Suspended students cannot submit achievements", ex.getMessage());
        verify(achievementRepository, never()).save(any());
    }

    @Test
    @DisplayName("Create achievement fails when student not found")
    void createAchievement_studentNotFound_throwsException() {
        when(studentRepository.findById(99L)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> achievementService.createAchievement(
                        99L, "Title", "Category", "Description",
                        "SLIIT", "University", "2026-01-15", null));

        assertEquals("Student not found", ex.getMessage());
    }

    @Test
    @DisplayName("Create achievement rejects invalid file type")
    void createAchievement_invalidFileType_throwsException() {
        when(studentRepository.findById(1L)).thenReturn(Optional.of(student));

        MockMultipartFile file = new MockMultipartFile(
                "file", "cert.exe", "application/octet-stream", "content".getBytes());

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> achievementService.createAchievement(
                        1L, "Title", "Category", "Description",
                        "SLIIT", "University", "2026-01-15", file));

        assertEquals("Only PDF, JPG, JPEG, and PNG files are allowed", ex.getMessage());
    }

    @Test
    @DisplayName("Get all achievements by student returns list")
    void getAllAchievementsByStudent_returnsAchievements() {
        when(achievementRepository.findByStudentId(1L)).thenReturn(List.of(achievement));

        List<Achievement> result = achievementService.getAllAchievementsByStudent(1L);

        assertEquals(1, result.size());
        assertEquals("Best Project Award", result.get(0).getTitle());
    }

    @Test
    @DisplayName("Get achievement by ID returns achievement")
    void getAchievementById_exists_returnsAchievement() {
        when(achievementRepository.findById(1L)).thenReturn(Optional.of(achievement));

        Achievement result = achievementService.getAchievementById(1L);

        assertNotNull(result);
        assertEquals(1L, result.getId());
    }

    @Test
    @DisplayName("Get achievement by ID throws when not found")
    void getAchievementById_notFound_throwsException() {
        when(achievementRepository.findById(99L)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> achievementService.getAchievementById(99L));

        assertEquals("Achievement not found", ex.getMessage());
    }

    @Test
    @DisplayName("Delete pending achievement succeeds")
    void deleteAchievement_pendingStatus_success() {
        achievement.setStatus(AchievementStatus.PENDING);
        when(achievementRepository.findById(1L)).thenReturn(Optional.of(achievement));

        assertDoesNotThrow(() -> achievementService.deleteAchievement(1L));
        verify(achievementRepository, times(1)).deleteById(1L);
    }

    @Test
    @DisplayName("Delete approved achievement throws exception")
    void deleteAchievement_approvedStatus_throwsException() {
        achievement.setStatus(AchievementStatus.APPROVED);
        when(achievementRepository.findById(1L)).thenReturn(Optional.of(achievement));

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> achievementService.deleteAchievement(1L));

        assertEquals("Approved achievements cannot be deleted", ex.getMessage());
        verify(achievementRepository, never()).deleteById(any());
    }

    @Test
    @DisplayName("Update achievement fails when student is not owner")
    void updateAchievement_notOwner_throwsException() {
        when(achievementRepository.findById(1L)).thenReturn(Optional.of(achievement));

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> achievementService.updateAchievement(
                        1L, 99L, "New Title", "Category", "Description",
                        "SLIIT", "University", "2026-01-15", null));

        assertEquals("You can only update your own achievement", ex.getMessage());
    }
}
