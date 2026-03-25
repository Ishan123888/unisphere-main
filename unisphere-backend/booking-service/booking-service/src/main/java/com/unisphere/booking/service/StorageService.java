package com.unisphere.booking.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class StorageService {

    private final Cloudinary cloudinary;

    /* ── Upload a file to Cloudinary ──────────────────────────────── */
    public String uploadFile(MultipartFile file, String folder) throws IOException {
        Map<?, ?> result = cloudinary.uploader().upload(
                file.getBytes(),
                ObjectUtils.asMap(
                        "folder", "unisphere/" + folder,
                        "resource_type", "auto"
                )
        );
        return (String) result.get("secure_url");
    }

    /* ── Delete a file by public ID ───────────────────────────────── */
    public void deleteFile(String publicId) throws IOException {
        cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
    }
}