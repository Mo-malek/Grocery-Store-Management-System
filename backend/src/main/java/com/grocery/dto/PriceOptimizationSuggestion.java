package com.grocery.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PriceOptimizationSuggestion {
    private Long productId;
    private String productName;
    private Integer currentStock;
    private BigDecimal currentPrice;
    private BigDecimal suggestedPrice;
    private String reason; // "SLOW_MOVING" or "EXPIRING_SOON"
    private String message;
}
