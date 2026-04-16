package com.unisphere.portfolio.dto;

import java.time.LocalDateTime;

public class SessionVideoFileResponse {
    private Long id;
    private Long sessionId;
    private String title;
    private String subtitle;
    private String fileName;
    private String filePath;
    private Long fileSize;
    private String mimeType;
    private LocalDateTime createdAt;

    public SessionVideoFileResponse() {}

    public SessionVideoFileResponse(Long id, Long sessionId, String title, String subtitle,
                                    String fileName, Long fileSize, String mimeType, LocalDateTime createdAt) {
        this.id = id;
        this.sessionId = sessionId;
        this.title = title;
        this.subtitle = subtitle;
        this.fileName = fileName;
        this.fileSize = fileSize;
        this.mimeType = mimeType;
        this.createdAt = createdAt;
    }

    public SessionVideoFileResponse(Long id, Long sessionId, String title, String subtitle,
                                    String fileName, String filePath, Long fileSize, String mimeType, LocalDateTime createdAt) {
        this.id = id;
        this.sessionId = sessionId;
        this.title = title;
        this.subtitle = subtitle;
        this.fileName = fileName;
        this.filePath = filePath;
        this.fileSize = fileSize;
        this.mimeType = mimeType;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getSessionId() {
        return sessionId;
    }

    public void setSessionId(Long sessionId) {
        this.sessionId = sessionId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getSubtitle() {
        return subtitle;
    }

    public void setSubtitle(String subtitle) {
        this.subtitle = subtitle;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getFilePath() {
        return filePath;
    }

    public void setFilePath(String filePath) {
        this.filePath = filePath;
    }

    public Long getFileSize() {
        return fileSize;
    }

    public void setFileSize(Long fileSize) {
        this.fileSize = fileSize;
    }

    public String getMimeType() {
        return mimeType;
    }

    public void setMimeType(String mimeType) {
        this.mimeType = mimeType;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
