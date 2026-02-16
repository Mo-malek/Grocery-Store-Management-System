package com.grocery.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SaleItemRequest {

    @NotNull(message = "لازم تحدد المنتج")
    private Long productId;

    @NotNull(message = "لازم تحدد الكمية")
    @Min(value = 1, message = "الكمية لازم تكون 1 على الأقل")
    private Integer quantity;
}
