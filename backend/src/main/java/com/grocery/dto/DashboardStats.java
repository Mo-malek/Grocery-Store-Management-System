package com.grocery.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStats {

    // KPIs
    private BigDecimal totalSalesToday;
    private BigDecimal totalSalesThisMonth;
    private BigDecimal posSalesToday;
    private BigDecimal onlineSalesToday;
    private BigDecimal posSalesThisMonth;
    private BigDecimal onlineSalesThisMonth;
    private Long transactionCountToday;
    private Long posTransactionCountToday;
    private Long onlineTransactionCountToday;
    private BigDecimal averageBasketSize;
    private BigDecimal estimatedProfitToday;
    private BigDecimal netProfitThisMonth;
    private BigDecimal totalExpensesThisMonth;

    // Inventory alerts
    private Long lowStockCount;
    private Long outOfStockCount;
    private Long expiringSoonCount;
    private List<com.grocery.entity.Product> lowStockProducts;

    // Top products
    private List<TopProduct> topProducts;

    // Daily sales (last 7 days)
    private List<DailySale> dailySales;

    // Peak hours
    private List<HourlySale> peakHours;
    private List<SaleView> recentSales;

    // Phase 11 New fields
    private List<HeatMapPoint> heatMap;
    private List<CategoryAnalytic> categoryAnalytics;
    private Integer storeHealthScore; // 0-100

    // Phase 12: Performance
    private List<EmployeePerformance> employeeLeaderboard;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategoryAnalytic {
        private String category;
        private Long totalQuantity;
        private BigDecimal totalRevenue;
        private BigDecimal totalProfit;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class HeatMapPoint {
        private Integer dayOfWeek;
        private Integer hour;
        private Long count;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TopProduct {
        private Long productId;
        private String productName;
        private Long totalQuantity;
        private BigDecimal totalRevenue;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DailySale {
        private String date;
        private Long transactionCount;
        private BigDecimal totalSales;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class HourlySale {
        private Integer hour;
        private Long transactionCount;
        private BigDecimal totalSales;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EmployeePerformance {
        private Long userId;
        private String fullName;
        private Long transactionCount;
        private BigDecimal totalSales;
    }
}
