package com.unisphere.portfolio.dto;

public class SessionVideoFileRequest {
    private Long sessionId;
    private String title;
    private String subtitle;
    private String filePath;
    private String fileName;
    private Long fileSize;
    private String mimeType;

    public SessionVideoFileRequest() {}

    public SessionVideoFileRequest(Long sessionId, String title, String subtitle, 
                                   String filePath, String fileName, Long fileSize, String mimeType) {
        this.sessionId = sessionId;
        this.title = title;
        this.subtitle = subtitle;
        this.filePath = filePath;
        this.fileName = fileName;
        this.fileSize = fileSize;
        this.mimeType = mimeType;
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

    public String getFilePath() {
        return filePath;
    }

    public void setFilePath(String filePath) {
        this.filePath = filePath;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
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
}
