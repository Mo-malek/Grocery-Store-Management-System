package com.grocery.dto;

import com.grocery.entity.DeliveryOrder;
import com.grocery.entity.DeliveryOrderItem;
import com.grocery.entity.Product;
import com.grocery.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DeliveryOrderDto {
    private Long id;
    private CustomerDto customer;
    private BigDecimal totalAmount;
    private BigDecimal deliveryFee;
    private String address;
    private String phone;
    private DeliveryOrder.DeliveryStatus status;
    private LocalDateTime createdAt;
    private List<ItemDto> items;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CustomerDto {
        private String username;
        private String fullName;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ItemDto {
        private Long productId;
        private String productName;
        private Integer quantity;
        private BigDecimal unitPrice;
    }

    public static DeliveryOrderDto fromEntity(DeliveryOrder order) {
        User u = order.getCustomer();
        return DeliveryOrderDto.builder()
                .id(order.getId())
                .customer(u == null ? null : CustomerDto.builder()
                        .username(u.getUsername())
                        .fullName(u.getFullName())
                        .build())
                .totalAmount(order.getTotalAmount())
                .deliveryFee(order.getDeliveryFee())
                .address(order.getAddress())
                .phone(order.getPhone())
                .status(order.getStatus())
                .createdAt(order.getCreatedAt())
                .items(order.getItems() == null ? List.of() :
                        order.getItems().stream().map(DeliveryOrderDto::mapItem).collect(Collectors.toList()))
                .build();
    }

    private static ItemDto mapItem(DeliveryOrderItem item) {
        Product p = item.getProduct();
        return ItemDto.builder()
                .productId(p == null ? null : p.getId())
                .productName(p == null ? null : p.getName())
                .quantity(item.getQuantity())
                .unitPrice(item.getPriceAtTimeOfOrder())
                .build();
    }
}

