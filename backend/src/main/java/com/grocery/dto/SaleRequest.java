package com.grocery.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class SaleRequest {

    private Long customerId; // اختياري

    @Valid
    @NotEmpty(message = "يجب إضافة منتج واحد على الأقل للفاتورة")
    private List<SaleItemRequest> items;

    private List<Long> bundleIds; // قائمة بأي عروض تم شراؤها

    private BigDecimal discount; // خصم (اختياري)

    @NotBlank(message = "يجب تحديد طريقة الدفع")
    private String paymentMethod; // CASH, CARD
}
