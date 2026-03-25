package com.unisphere.identity.repository;
import com.unisphere.identity.entity.UserCredential;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface UserCredentialRepository extends JpaRepository<UserCredential, Integer> {
    Optional<UserCredential> findByUsername(String username);
    List<UserCredential> findByRole(String role);
    List<UserCredential> findByRoleAndStatus(String role, String status);
}