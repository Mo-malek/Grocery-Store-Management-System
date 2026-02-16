package com.grocery.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "stock_logs")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StockLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false)
    private Integer quantityChange;

    @Column(nullable = false)
    private String type; // SALE, RESTOCK, ADJUSTMENT, WASTE

    private String reason;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
