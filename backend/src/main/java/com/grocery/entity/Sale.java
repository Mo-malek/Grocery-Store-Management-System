package com.grocery.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "sale")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Sale {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id")
    private Customer customer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cashier_id")
    private User cashier;

    @Column(nullable = false)
    private BigDecimal subtotal;

    @Builder.Default
    private BigDecimal discount = BigDecimal.ZERO;

    @Column(nullable = false)
    private BigDecimal total;

    @Column(name = "payment_method")
    @Builder.Default
    private String paymentMethod = "CASH";

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "sale", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    @com.fasterxml.jackson.annotation.JsonManagedReference
    private List<SaleItem> items = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    /**
     * إضافة صنف للفاتورة
     */
    public void addItem(SaleItem item) {
        items.add(item);
        item.setSale(this);
    }
}
