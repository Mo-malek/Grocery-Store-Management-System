package com.grocery.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StockAuditReport {
    private Long productId;
    private String productName;
    private Long totalSold;
    private Long totalManualLoss;
    private Double lossRate;
}
