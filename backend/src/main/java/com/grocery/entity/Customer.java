package com.grocery.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "customer")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Customer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String phone;

    @Column(name = "total_purchases")
    @Builder.Default
    private BigDecimal totalPurchases = BigDecimal.ZERO;

    @Column(name = "loyalty_points")
    @Builder.Default
    private Integer loyaltyPoints = 0;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "last_visit_at")
    private LocalDateTime lastVisitAt;

    @Column(name = "avg_ticket_size")
    @Builder.Default
    private BigDecimal avgTicketSize = BigDecimal.ZERO;

    @Column(name = "favorite_category")
    private String favoriteCategory;

    @Column(name = "visit_count")
    @Builder.Default
    private Integer visitCount = 0;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    /**
     * إضافة مشتريات وحساب نقاط الولاء
     * كل 1000 جنيه = 30 نقطة
     */
    public void addPurchase(BigDecimal amount) {
        this.totalPurchases = this.totalPurchases.add(amount);
        // Calculate new loyalty points: 30 points per 1000 EGP of total purchases
        this.loyaltyPoints = this.totalPurchases
                .divide(BigDecimal.valueOf(1000), 0, java.math.RoundingMode.FLOOR)
                .intValue() * 30;
    }
}
