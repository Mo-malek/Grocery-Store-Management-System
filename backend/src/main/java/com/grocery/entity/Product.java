package com.grocery.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "product")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    @NotBlank(message = "اسم المنتج لا يمكن أن يكون فارغاً")
    private String name;

    private String barcode;

    private String category;

    @Column(name = "purchase_price", nullable = false)
    @NotNull(message = "سعر الشراء مطلوب")
    @PositiveOrZero(message = "سعر الشراء يجب أن يكون 0 أو أكثر")
    private BigDecimal purchasePrice;

    @Column(name = "selling_price", nullable = false)
    @NotNull(message = "سعر البيع مطلوب")
    @PositiveOrZero(message = "سعر البيع يجب أن يكون 0 أو أكثر")
    private BigDecimal sellingPrice;

    @Column(name = "current_stock", nullable = false)
    @NotNull(message = "المخزون الحالي مطلوب")
    @PositiveOrZero(message = "المخزون لا يمكن أن يكون سالباً")
    @Builder.Default
    private Integer currentStock = 0;

    @Column(name = "min_stock", nullable = false)
    @NotNull(message = "الحد الأدنى للمخزون مطلوب")
    @PositiveOrZero(message = "الحد الأدنى لا يمكن أن يكون سالباً")
    @Builder.Default
    private Integer minStock = 5;

    @Builder.Default
    private String unit = "قطعة";

    @Builder.Default
    private Boolean active = true;

    private java.time.LocalDate expiryDate;

    private String manufacturer;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "discount_percentage")
    @Builder.Default
    private BigDecimal discountPercentage = BigDecimal.ZERO;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(name = "rating_average")
    @Builder.Default
    private BigDecimal ratingAverage = BigDecimal.ZERO;

    @Column(name = "rating_count")
    @Builder.Default
    private Integer ratingCount = 0;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    /**
     * هامش الربح = سعر البيع - سعر الشراء
     */
    public BigDecimal getProfitMargin() {
        return sellingPrice.subtract(purchasePrice);
    }

    /**
     * نسبة الربح = (هامش الربح / سعر الشراء) × 100
     */
    public BigDecimal getProfitPercentage() {
        if (purchasePrice.compareTo(BigDecimal.ZERO) == 0)
            return BigDecimal.ZERO;
        return getProfitMargin()
                .divide(purchasePrice, 2, java.math.RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100));
    }

    /**
     * هل المنتج تحت الحد الأدنى؟
     */
    public boolean isLowStock() {
        return currentStock <= minStock;
    }
}
