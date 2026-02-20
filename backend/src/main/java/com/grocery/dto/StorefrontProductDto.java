package com.grocery.dto;

import com.grocery.entity.Product;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StorefrontProductDto {
    private Long id;
    private String name;
    private String barcode;
    private String category;
    private String unit;
    private BigDecimal price;
    private Integer stock;
    private boolean lowStock;
    private String imageUrl;
    private String description;
    private BigDecimal ratingAverage;
    private Integer ratingCount;
    private BigDecimal discountPercentage;
    private String manufacturer;

    public static StorefrontProductDto fromEntity(Product p) {
        return StorefrontProductDto.builder()
                .id(p.getId())
                .name(p.getName())
                .barcode(p.getBarcode())
                .category(p.getCategory())
                .unit(p.getUnit())
                .price(p.getSellingPrice())
                .stock(p.getCurrentStock())
                .lowStock(p.isLowStock())
                .imageUrl(p.getImageUrl())
                .description(p.getDescription())
                .ratingAverage(p.getRatingAverage())
                .ratingCount(p.getRatingCount())
                .discountPercentage(p.getDiscountPercentage())
                .manufacturer(p.getManufacturer())
                .build();
    }
}
