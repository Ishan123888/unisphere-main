package com.unisphere.identity.repository;

import com.unisphere.identity.entity.UserCredential;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserCredentialRepository extends JpaRepository<UserCredential, Integer> {

    // User ලොග් වෙද්දී username එකෙන් එයාගේ විස්තර හොයාගන්න මේ method එක පාවිච්චි කරනවා
    Optional<UserCredential> findByUsername(String username);

}