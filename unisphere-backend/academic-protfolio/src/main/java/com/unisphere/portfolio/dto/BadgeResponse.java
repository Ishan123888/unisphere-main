package com.unisphere.portfolio.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BadgeResponse {
    private Long id;
    private String badgeName;
    private String description;
}