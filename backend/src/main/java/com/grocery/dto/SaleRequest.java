package com.grocery.dto;

import jakarta.validation.Valid;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class SaleRequest {

    private Long customerId; // اختياري

    @Valid
    private List<SaleItemRequest> items;

    private List<Long> bundleIds; // قائمة بأي عروض تم شراؤها

    private BigDecimal discount; // خصم (اختياري)

    private String paymentMethod; // CASH, CARD
}
