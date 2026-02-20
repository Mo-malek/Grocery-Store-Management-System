package com.grocery.dto;

import com.grocery.entity.Bundle;
import com.grocery.entity.BundleItem;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StorefrontBundleDto {
    private Long id;
    private String name;
    private BigDecimal price;
    private List<BundleItemDto> items;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BundleItemDto {
        private Long productId;
        private String productName;
        private Integer quantity;
    }

    public static StorefrontBundleDto fromEntity(Bundle b) {
        return StorefrontBundleDto.builder()
                .id(b.getId())
                .name(b.getName())
                .price(b.getPrice())
                .items(b.getItems() == null ? List.of() :
                        b.getItems().stream()
                                .map(StorefrontBundleDto::mapItem)
                                .collect(Collectors.toList()))
                .build();
    }

    private static BundleItemDto mapItem(BundleItem item) {
        return BundleItemDto.builder()
                .productId(item.getProduct().getId())
                .productName(item.getProduct().getName())
                .quantity(item.getQuantity())
                .build();
    }
}
