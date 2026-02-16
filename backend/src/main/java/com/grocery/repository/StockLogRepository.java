package com.grocery.repository;

import com.grocery.entity.StockLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

import org.springframework.data.jpa.repository.Query;

public interface StockLogRepository extends JpaRepository<StockLog, Long> {
    List<StockLog> findByProductIdOrderByCreatedAtDesc(Long productId);

    @Query("SELECT sl.product.id, sl.product.name, " +
            "SUM(CASE WHEN sl.type = 'SALE' THEN ABS(sl.quantityChange) ELSE 0 END) as sold, " +
            "SUM(CASE WHEN sl.type IN ('ADJUSTMENT', 'WASTE') AND sl.quantityChange < 0 THEN ABS(sl.quantityChange) ELSE 0 END) as loss "
            +
            "FROM StockLog sl GROUP BY sl.product.id, sl.product.name HAVING SUM(CASE WHEN sl.type = 'SALE' THEN ABS(sl.quantityChange) ELSE 0 END) > 0")
    List<Object[]> getAuditSummary();
}
