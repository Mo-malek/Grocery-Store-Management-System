package com.grocery.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class SaleRequest {

    private Long customerId;

    @Valid
    @NotEmpty(message = "At least one item is required")
    private List<SaleItemRequest> items;

    private List<Long> bundleIds;

    private BigDecimal discount;

    private String externalCustomerName;
    private String externalCustomerPhone;
    private String externalCustomerAddress;

    @NotBlank(message = "Payment method is required")
    private String paymentMethod; // CASH, CARD
}
