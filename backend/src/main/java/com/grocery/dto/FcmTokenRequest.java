package com.grocery.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class FcmTokenRequest {
    @NotBlank(message = "Token is required")
    private String token;

    private String deviceType;
}
