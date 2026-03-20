package com.vehiclerentalsystem.studylobbyservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class StudyLobbyServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(StudyLobbyServiceApplication.class, args);
    }
}
