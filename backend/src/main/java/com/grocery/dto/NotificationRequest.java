package com.grocery.dto;

import lombok.Builder;
import lombok.Data;

import java.util.Map;

@Data
@Builder
public class NotificationRequest {
    private String recipientToken;
    private String title;
    private String body;
    private String image;
    private Map<String, String> data;
}
