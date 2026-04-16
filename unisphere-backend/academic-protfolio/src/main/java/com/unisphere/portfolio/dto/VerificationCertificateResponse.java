package com.unisphere.portfolio.dto;

public class VerificationCertificateResponse {

    private String certificateId;
    private String studentName;
    private String achievementTitle;
    private String category;
    private String level;
    private String institution;
    private String achievementDate;
    private String issuedDate;
    private String certificateUrl;

    public VerificationCertificateResponse() {}

    public VerificationCertificateResponse(
            String certificateId,
            String studentName,
            String achievementTitle,
            String category,
            String level,
            String institution,
            String achievementDate,
            String issuedDate,
            String certificateUrl
    ) {
        this.certificateId = certificateId;
        this.studentName = studentName;
        this.achievementTitle = achievementTitle;
        this.category = category;
        this.level = level;
        this.institution = institution;
        this.achievementDate = achievementDate;
        this.issuedDate = issuedDate;
        this.certificateUrl = certificateUrl;
    }

    public String getCertificateId() { return certificateId; }
    public void setCertificateId(String certificateId) { this.certificateId = certificateId; }

    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }

    public String getAchievementTitle() { return achievementTitle; }
    public void setAchievementTitle(String achievementTitle) { this.achievementTitle = achievementTitle; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getLevel() { return level; }
    public void setLevel(String level) { this.level = level; }

    public String getInstitution() { return institution; }
    public void setInstitution(String institution) { this.institution = institution; }

    public String getAchievementDate() { return achievementDate; }
    public void setAchievementDate(String achievementDate) { this.achievementDate = achievementDate; }

    public String getIssuedDate() { return issuedDate; }
    public void setIssuedDate(String issuedDate) { this.issuedDate = issuedDate; }

    public String getCertificateUrl() { return certificateUrl; }
    public void setCertificateUrl(String certificateUrl) { this.certificateUrl = certificateUrl; }
}
