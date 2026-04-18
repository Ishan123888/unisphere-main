package com.unisphere.portfolio.service;

import com.unisphere.portfolio.dto.AdminCreateRequest;
import com.unisphere.portfolio.dto.AdminProfileUpdateRequest;
import com.unisphere.portfolio.dto.AdminResponse;
import com.unisphere.portfolio.entity.*;
import com.unisphere.portfolio.repository.*;
import com.unisphere.portfolio.service.impl.AdminServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AdminService Tests")
class AdminServiceImplTest {

    @Mock private AchievementRepository achievementRepository;
    @Mock private StudentRepository studentRepository;
    @Mock private BadgeRepository badgeRepository;
    @Mock private StudentBadgeRepository studentBadgeRepository;
    @Mock private AdminRepository adminRepository;

    @InjectMocks
    private AdminServiceImpl adminService;

    private Admin admin;
    private Student student;
    private Achievement achievement;

    @BeforeEach
    void setUp() {
        admin = new Admin();
        admin.setId(1L);
        admin.setUsername("admin");
        admin.setPassword("admin123");
        admin.setFullName("System Admin");
        admin.setEmail("admin@unisphere.lk");

        student = new Student();
        student.setId(1L);
        student.setUsername("it24100001");
        student.setFullName("Demo Student");
        student.setStatus(UserStatus.ACTIVE);

        achievement = new Achievement();
        achievement.setId(1L);
        achievement.setStudent(student);
        achievement.setTitle("Best Project");
        achievement.setStatus(AchievementStatus.PENDING);
        achievement.setCreatedAt(LocalDateTime.now());
        achievement.setUpdatedAt(LocalDateTime.now());
    }

    @Test
    @DisplayName("Get pending achievements returns only PENDING")
    void getPendingAchievements_returnsPendingList() {
        when(achievementRepository.findByStatus(AchievementStatus.PENDING))
                .thenReturn(List.of(achievement));

        List<Achievement> result = adminService.getPendingAchievements();

        assertEquals(1, result.size());
        assertEquals(AchievementStatus.PENDING, result.get(0).getStatus());
    }

    @Test
    @DisplayName("Approve achievement sets status to APPROVED")
    void approveAchievement_setsApprovedStatus() {
        when(achievementRepository.findById(1L)).thenReturn(Optional.of(achievement));
        when(achievementRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(achievementRepository.countByStudentIdAndStatus(1L, AchievementStatus.APPROVED))
                .thenReturn(0L);

        Achievement result = adminService.approveAchievement(1L, "Well done!");

        assertEquals(AchievementStatus.APPROVED, result.getStatus());
        assertEquals("Well done!", result.getAdminComment());
    }

    @Test
    @DisplayName("Reject achievement sets status to REJECTED")
    void rejectAchievement_setsRejectedStatus() {
        when(achievementRepository.findById(1L)).thenReturn(Optional.of(achievement));
        when(achievementRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        Achievement result = adminService.rejectAchievement(1L, "Insufficient evidence");

        assertEquals(AchievementStatus.REJECTED, result.getStatus());
        assertEquals("Insufficient evidence", result.getAdminComment());
    }

    @Test
    @DisplayName("Approve achievement throws when not found")
    void approveAchievement_notFound_throwsException() {
        when(achievementRepository.findById(99L)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> adminService.approveAchievement(99L, "comment"));
        assertEquals("Achievement not found", ex.getMessage());
    }

    @Test
    @DisplayName("Suspend student sets status to SUSPENDED")
    void suspendStudent_setsStatusSuspended() {
        when(studentRepository.findById(1L)).thenReturn(Optional.of(student));
        when(studentRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        Student result = adminService.suspendStudent(1L);

        assertEquals(UserStatus.SUSPENDED, result.getStatus());
    }

    @Test
    @DisplayName("Suspend student throws when not found")
    void suspendStudent_notFound_throwsException() {
        when(studentRepository.findById(99L)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> adminService.suspendStudent(99L));
        assertEquals("Student not found", ex.getMessage());
    }

    @Test
    @DisplayName("Get admin profile returns correct data")
    void getAdminProfile_returnsAdminResponse() {
        when(adminRepository.findById(1L)).thenReturn(Optional.of(admin));

        AdminResponse response = adminService.getAdminProfile(1L);

        assertNotNull(response);
        assertEquals("admin", response.getUsername());
        assertEquals("System Admin", response.getFullName());
    }

    @Test
    @DisplayName("Create admin fails when username already exists")
    void createAdmin_duplicateUsername_throwsException() {
        when(adminRepository.findByUsername("admin")).thenReturn(Optional.of(admin));

        AdminCreateRequest request = new AdminCreateRequest();
        request.setUsername("admin");
        request.setPassword("pass");
        request.setFullName("Another Admin");

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> adminService.createAdmin(request));
        assertEquals("Username already exists", ex.getMessage());
    }

    @Test
    @DisplayName("Create admin succeeds with unique username")
    void createAdmin_uniqueUsername_success() {
        when(adminRepository.findByUsername("newadmin")).thenReturn(Optional.empty());
        when(adminRepository.save(any())).thenAnswer(inv -> {
            Admin a = inv.getArgument(0);
            a.setId(2L);
            return a;
        });

        AdminCreateRequest request = new AdminCreateRequest();
        request.setUsername("newadmin");
        request.setPassword("pass123");
        request.setFullName("New Admin");

        AdminResponse response = adminService.createAdmin(request);

        assertNotNull(response);
        assertEquals("newadmin", response.getUsername());
    }

    @Test
    @DisplayName("Auto-assign badge when 5 achievements approved")
    void approveAchievement_fiveApproved_assignsBadge() {
        when(achievementRepository.findById(1L)).thenReturn(Optional.of(achievement));
        when(achievementRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(achievementRepository.countByStudentIdAndStatus(1L, AchievementStatus.APPROVED))
                .thenReturn(5L);

        Badge badge = new Badge();
        badge.setBadgeName("Verified Achiever");

        when(badgeRepository.findByBadgeName("Verified Achiever")).thenReturn(Optional.of(badge));
        when(studentBadgeRepository.existsByStudentIdAndBadgeId(1L, badge.getId())).thenReturn(false);
        when(studentRepository.findById(1L)).thenReturn(Optional.of(student));
        when(studentBadgeRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        adminService.approveAchievement(1L, "Great work!");

        verify(studentBadgeRepository, times(1)).save(any(StudentBadge.class));
    }

    @Test
    @DisplayName("Badge not assigned twice for same student")
    void approveAchievement_badgeAlreadyExists_notAssignedAgain() {
        when(achievementRepository.findById(1L)).thenReturn(Optional.of(achievement));
        when(achievementRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(achievementRepository.countByStudentIdAndStatus(1L, AchievementStatus.APPROVED))
                .thenReturn(5L);

        Badge badge = new Badge();
        badge.setBadgeName("Verified Achiever");

        when(badgeRepository.findByBadgeName("Verified Achiever")).thenReturn(Optional.of(badge));
        when(studentBadgeRepository.existsByStudentIdAndBadgeId(1L, badge.getId())).thenReturn(true);

        adminService.approveAchievement(1L, "Great work!");

        verify(studentBadgeRepository, never()).save(any(StudentBadge.class));
    }
}
