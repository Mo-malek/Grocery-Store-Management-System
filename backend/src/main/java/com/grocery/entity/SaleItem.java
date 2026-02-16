package com.grocery.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "sale_item")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SaleItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sale_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonBackReference
    @ToString.Exclude
    private Sale sale;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bundle_id")
    private Bundle bundle;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "unit_price", nullable = false)
    private BigDecimal unitPrice;

    @Column(nullable = false)
    private BigDecimal total;

    /**
     * حساب إجمالي الصنف
     */
    public void calculateTotal() {
        this.total = this.unitPrice.multiply(BigDecimal.valueOf(this.quantity));
    }
}
