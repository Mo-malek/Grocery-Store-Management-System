package com.grocery.dto;

import lombok.Data;

@Data
public class SubscribeRequest {
    private String token;
    private String deviceType;
}
