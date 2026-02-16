package com.grocery.repository;

import com.grocery.entity.Sale;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SaleRepository extends JpaRepository<Sale, Long> {

        // فواتير عميل معين
        List<Sale> findByCustomerIdOrderByCreatedAtDesc(Long customerId);

        // فواتير في نطاق تاريخ
        List<Sale> findByCreatedAtBetweenOrderByCreatedAtDesc(LocalDateTime start, LocalDateTime end);

        // إجمالي المبيعات اليوم
        @Query("SELECT COALESCE(SUM(s.total), 0) FROM Sale s WHERE s.createdAt >= :start AND s.createdAt < :end")
        BigDecimal getTotalSalesBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

        // عدد الفواتير اليوم
        @Query("SELECT COUNT(s) FROM Sale s WHERE s.createdAt >= :start AND s.createdAt < :end")
        Long getTransactionCountBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

        // أعلى المنتجات مبيعاً
        @Query("SELECT si.product.id, si.product.name, SUM(si.quantity) as totalQty, SUM(si.total) as totalRevenue " +
                        "FROM SaleItem si WHERE si.sale.createdAt >= :start AND si.sale.createdAt < :end " +
                        "GROUP BY si.product.id, si.product.name ORDER BY totalRevenue DESC")
        List<Object[]> getTopProducts(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

        // المبيعات حسب الساعة (لتحليل أوقات الذروة)
        @Query(value = "SELECT EXTRACT(HOUR FROM created_at) as hour, COUNT(*) as count, SUM(total) as total " +
                        "FROM sale WHERE created_at >= :start AND created_at < :end " +
                        "GROUP BY EXTRACT(HOUR FROM created_at) ORDER BY hour", nativeQuery = true)
        List<Object[]> getSalesByHour(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

        // إجمالي المبيعات اليومية (آخر 7 أيام)
        @Query("SELECT CAST(s.createdAt AS DATE) as saleDate, COUNT(s) as count, SUM(s.total) as total " +
                        "FROM Sale s WHERE s.createdAt >= :start " +
                        "GROUP BY CAST(s.createdAt AS DATE) ORDER BY saleDate")
        List<Object[]> getDailySales(@Param("start") LocalDateTime start);

        @Query("SELECT COALESCE(SUM(si.quantity * (si.unitPrice - p.purchasePrice)), 0) " +
                        "FROM SaleItem si JOIN si.product p " +
                        "WHERE si.sale.createdAt >= :start AND si.sale.createdAt < :end")
        BigDecimal getGrossProfitBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

        @Query("SELECT si.product.id, SUM(si.quantity) FROM SaleItem si WHERE si.sale.createdAt >= :since GROUP BY si.product.id")
        List<Object[]> getProductSalesSince(@Param("since") LocalDateTime since);

        // المنتجات التي تُشترى معاً
        @Query("SELECT si2.product.id, si2.product.name, COUNT(si2) as frequency " +
                        "FROM SaleItem si1 " +
                        "JOIN SaleItem si2 ON si1.sale.id = si2.sale.id " +
                        "WHERE si1.product.id IN :productIds " +
                        "AND si2.product.id NOT IN :productIds " +
                        "GROUP BY si2.product.id, si2.product.name " +
                        "ORDER BY frequency DESC")
        List<Object[]> getFrequentlyBoughtWith(@Param("productIds") List<Long> productIds);

        // الربح والمبيعات حسب التصنيف
        @Query("SELECT p.category, SUM(si.quantity) as totalQty, SUM(si.total) as totalRevenue, " +
                        "SUM(si.quantity * (si.unitPrice - p.purchasePrice)) as totalProfit " +
                        "FROM SaleItem si JOIN si.product p " +
                        "WHERE si.sale.createdAt >= :start AND si.sale.createdAt < :end " +
                        "GROUP BY p.category ORDER BY totalProfit DESC")
        List<Object[]> getCategoryAnalytics(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

        // خريطة الحرارة للمبيعات (يوم الأسبوع والساعة)
        // PostgreSQL: EXTRACT(ISODOW FROM date) returns 1 (Monday) to 7 (Sunday)
        @Query(value = "SELECT EXTRACT(ISODOW FROM created_at) as dayOfWeek, EXTRACT(HOUR FROM created_at) as hour, COUNT(*) as count "
                        +
                        "FROM sale WHERE created_at >= :start " +
                        "GROUP BY EXTRACT(ISODOW FROM created_at), EXTRACT(HOUR FROM created_at) ORDER BY dayOfWeek, hour", nativeQuery = true)
        List<Object[]> getSalesHeatMap(@Param("start") LocalDateTime start);

        // ترتيب الموظفين حسب المبيعات
        @Query("SELECT s.cashier.id, s.cashier.fullName, COUNT(s) as count, SUM(s.total) as total " +
                        "FROM Sale s WHERE s.createdAt >= :start AND s.createdAt < :end AND s.cashier IS NOT NULL " +
                        "GROUP BY s.cashier.id, s.cashier.fullName ORDER BY total DESC")
        List<Object[]> getEmployeeLeaderboard(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
}
