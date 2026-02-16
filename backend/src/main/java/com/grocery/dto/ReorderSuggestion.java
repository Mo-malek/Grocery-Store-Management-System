package com.grocery.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReorderSuggestion {
    private Long productId;
    private String productName;
    private Integer currentStock;
    private Double dailyVelocity; // average sales per day
    private Double daysUntilOut;
    private Integer suggestedReorderQuantity;
    private String unit;
}
