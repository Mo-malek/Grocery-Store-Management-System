package com.grocery.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecommendationSuggestion {
    private Long productId;
    private String productName;
    private Long frequency;
    private String category;
    private Double price;
}
