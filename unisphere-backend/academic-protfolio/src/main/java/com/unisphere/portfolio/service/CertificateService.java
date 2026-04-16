package com.unisphere.portfolio.service;

import com.unisphere.portfolio.dto.VerificationCertificateResponse;

public interface CertificateService {
    VerificationCertificateResponse generateVerificationCertificate(Long achievementId);
}
