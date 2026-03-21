package com.unisphere.portfolio.repository;

import com.unisphere.portfolio.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StudentRepository extends JpaRepository<Student, Long> {
}