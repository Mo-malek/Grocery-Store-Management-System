package com.grocery.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "bundle")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Bundle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private BigDecimal price;

    @Builder.Default
    private boolean active = true;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @OneToMany(mappedBy = "bundle", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<BundleItem> items;
}
