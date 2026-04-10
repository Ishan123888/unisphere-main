package com.unisphere.portfolio.service.impl;

import com.unisphere.portfolio.dto.VerificationCertificateResponse;
import com.unisphere.portfolio.entity.Achievement;
import com.unisphere.portfolio.entity.AchievementStatus;
import com.unisphere.portfolio.repository.AchievementRepository;
import com.unisphere.portfolio.service.CertificateService;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Service
public class CertificateServiceImpl implements CertificateService {

    private final AchievementRepository achievementRepository;

    public CertificateServiceImpl(AchievementRepository achievementRepository) {
        this.achievementRepository = achievementRepository;
    }

    @Override
    public VerificationCertificateResponse generateVerificationCertificate(Long achievementId) {
        Achievement achievement = achievementRepository.findById(achievementId)
                .orElseThrow(() -> new RuntimeException("Achievement not found"));

        if (achievement.getStatus() != AchievementStatus.APPROVED) {
            throw new RuntimeException("Only approved achievements can generate verification certificates");
        }

        String certificateId = "CERT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        String issuedDate = LocalDate.now().format(DateTimeFormatter.ofPattern("dd MMM yyyy"));
        String achievementDateFormatted = achievement.getAchievementDate()
                .format(DateTimeFormatter.ofPattern("dd MMM yyyy"));

        return new VerificationCertificateResponse(
                certificateId,
                achievement.getStudent().getFullName(),
                achievement.getTitle(),
                achievement.getCategory(),
                achievement.getLevel(),
                achievement.getInstitution(),
                achievementDateFormatted,
                issuedDate,
                "/api/student/achievements/" + achievementId + "/verification-certificate"
        );
    }
}
