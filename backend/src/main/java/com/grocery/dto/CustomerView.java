package com.grocery.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerView {
    private Long id;
    private String name;
    private String phone;
    private BigDecimal totalPurchases;
    private Integer loyaltyPoints;
    private LocalDateTime createdAt;
}
