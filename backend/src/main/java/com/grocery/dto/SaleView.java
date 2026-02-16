package com.grocery.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SaleView {
    private Long id;
    private CustomerView customer;
    private BigDecimal subtotal;
    private BigDecimal discount;
    private BigDecimal total;
    private String paymentMethod;
    private LocalDateTime createdAt;
    private List<SaleItemView> items;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SaleItemView {
        private Long id;
        private Long productId;
        private String productName;
        private Integer quantity;
        private BigDecimal unitPrice;
        private BigDecimal total;
    }
}
