package com.unisphere.portfolio.config;

import com.unisphere.portfolio.entity.Admin;
import com.unisphere.portfolio.repository.AdminRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final AdminRepository adminRepository;

    public DataInitializer(AdminRepository adminRepository) {
        this.adminRepository = adminRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        // Create default admin if not exists
        if (adminRepository.findByUsername("admin").isEmpty()) {
            Admin admin = new Admin();
            admin.setUsername("admin");
            admin.setPassword("admin123");
            admin.setFullName("System Administrator");
            adminRepository.save(admin);
            System.out.println("✓ Default admin created: username=admin, password=admin123");
        }
    }
}
