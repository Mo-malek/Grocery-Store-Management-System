package com.grocery.dto;

import com.grocery.entity.Product;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.math.RoundingMode;

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
        BigDecimal discount = normalizeDiscount(p.getDiscountPercentage());
        BigDecimal effectivePrice = calculateEffectivePrice(p.getSellingPrice(), discount);
        return StorefrontProductDto.builder()
                .id(p.getId())
                .name(p.getName())
                .barcode(p.getBarcode())
                .category(p.getCategory())
                .unit(p.getUnit())
                .price(effectivePrice)
                .stock(p.getCurrentStock())
                .lowStock(p.isLowStock())
                .imageUrl(p.getImageUrl())
                .description(p.getDescription())
                .ratingAverage(p.getRatingAverage())
                .ratingCount(p.getRatingCount())
                .discountPercentage(discount)
                .manufacturer(p.getManufacturer())
                .build();
    }

    private static BigDecimal calculateEffectivePrice(BigDecimal sellingPrice, BigDecimal discountPercentage) {
        if (sellingPrice == null) {
            return BigDecimal.ZERO;
        }
        if (discountPercentage.compareTo(BigDecimal.ZERO) <= 0) {
            return sellingPrice;
        }
        BigDecimal ratio = BigDecimal.ONE.subtract(discountPercentage.divide(BigDecimal.valueOf(100), 6, RoundingMode.HALF_UP));
        return sellingPrice.multiply(ratio).setScale(2, RoundingMode.HALF_UP);
    }

    private static BigDecimal normalizeDiscount(BigDecimal discountPercentage) {
        if (discountPercentage == null) {
            return BigDecimal.ZERO;
        }
        return discountPercentage.max(BigDecimal.ZERO).min(BigDecimal.valueOf(100)).setScale(2, RoundingMode.HALF_UP);
    }
}
