package com.grocery.dto;

import com.grocery.entity.AppNotification;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class AppNotificationDto {
    private Long id;
    private String title;
    private String body;
    private String type;
    private String relatedEntityId;
    private boolean isRead;
    private LocalDateTime createdAt;

    public static AppNotificationDto fromEntity(AppNotification entity) {
        return AppNotificationDto.builder()
                .id(entity.getId())
                .title(entity.getTitle())
                .body(entity.getBody())
                .type(entity.getType())
                .relatedEntityId(entity.getRelatedEntityId())
                .isRead(entity.isRead())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
