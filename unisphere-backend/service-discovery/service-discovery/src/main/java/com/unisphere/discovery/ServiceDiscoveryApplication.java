package com.unisphere.discovery;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.netflix.eureka.server.EnableEurekaServer; // මෙම import එක තිබිය යුතුයි

@EnableEurekaServer // <-- මෙය අනිවාර්යයෙන්ම තිබිය යුතුයි
@SpringBootApplication
public class ServiceDiscoveryApplication {

	public static void main(String[] args) {
		SpringApplication.run(ServiceDiscoveryApplication.class, args);
	}
}