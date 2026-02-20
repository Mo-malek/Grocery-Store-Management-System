package com.grocery.dto;

import com.grocery.entity.Review;
import com.grocery.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StorefrontReviewDto {
    private Long id;
    private String username;
    private String fullName;
    private Integer rating;
    private String comment;
    private LocalDateTime createdAt;

    public static StorefrontReviewDto fromEntity(Review r) {
        User u = r.getUser();
        return StorefrontReviewDto.builder()
                .id(r.getId())
                .username(u == null ? null : u.getUsername())
                .fullName(u == null ? null : u.getFullName())
                .rating(r.getRating())
                .comment(r.getComment())
                .createdAt(r.getCreatedAt())
                .build();
    }
}

