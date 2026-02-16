package com.grocery.service;

import com.grocery.dto.DashboardStats;
import com.grocery.repository.ProductRepository;
import com.grocery.repository.SaleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;
import com.grocery.entity.Sale;
import com.grocery.dto.SaleView;
import com.grocery.dto.CustomerView;

@Service
@RequiredArgsConstructor
public class DashboardService {

        private final SaleRepository saleRepository;
        private final ProductRepository productRepository;
        private final com.grocery.repository.ExpenseRepository expenseRepository;
        private final com.grocery.repository.CustomerRepository customerRepository;

        /**
         * جمع كل إحصائيات لوحة التحكم
         */
        public DashboardStats getStats() {
                LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
                LocalDateTime endOfDay = LocalDate.now().atTime(LocalTime.MAX);
                LocalDateTime startOfMonth = LocalDate.now().withDayOfMonth(1).atStartOfDay();
                LocalDateTime startOfWeek = LocalDate.now().minusDays(7).atStartOfDay();

                // KPIs
                BigDecimal totalSalesToday = saleRepository.getTotalSalesBetween(startOfDay, endOfDay);
                BigDecimal totalSalesThisMonth = saleRepository.getTotalSalesBetween(startOfMonth, endOfDay);
                Long transactionCount = saleRepository.getTransactionCountBetween(startOfDay, endOfDay);

                BigDecimal averageBasket = transactionCount > 0
                                ? totalSalesToday.divide(BigDecimal.valueOf(transactionCount), 2, RoundingMode.HALF_UP)
                                : BigDecimal.ZERO;

                // الربح التقديري لليوم والشهر
                BigDecimal estimatedProfitToday = saleRepository.getGrossProfitBetween(startOfDay, endOfDay);
                BigDecimal grossProfitMonth = saleRepository.getGrossProfitBetween(startOfMonth, endOfDay);

                // المصاريف
                BigDecimal totalExpensesMonth = expenseRepository.getTotalExpensesBetween(startOfMonth, endOfDay);
                if (totalExpensesMonth == null)
                        totalExpensesMonth = BigDecimal.ZERO;

                // صافي الربح = الربح الإجمالي - المصاريف
                BigDecimal netProfitMonth = grossProfitMonth.subtract(totalExpensesMonth);

                // عدد المنتجات تحت الحد الأدنى
                List<com.grocery.entity.Product> lowStockItems = productRepository.findLowStockProducts();
                long lowStockCount = lowStockItems.size();

                // أعلى 10 منتجات مبيعاً هذا الشهر
                List<DashboardStats.TopProduct> topProducts = saleRepository.getTopProducts(startOfMonth, endOfDay)
                                .stream()
                                .limit(10)
                                .map(row -> DashboardStats.TopProduct.builder()
                                                .productId((Long) row[0])
                                                .productName((String) row[1])
                                                .totalQuantity(((Number) row[2]).longValue())
                                                .totalRevenue((BigDecimal) row[3])
                                                .build())
                                .collect(Collectors.toList());

                // المبيعات اليومية (آخر 7 أيام)
                List<DashboardStats.DailySale> dailySales = saleRepository.getDailySales(startOfWeek)
                                .stream()
                                .map(row -> DashboardStats.DailySale.builder()
                                                .date(row[0].toString())
                                                .transactionCount(((Number) row[1]).longValue())
                                                .totalSales((BigDecimal) row[2])
                                                .build())
                                .collect(Collectors.toList());

                // أوقات الذروة (اليوم)
                List<DashboardStats.HourlySale> peakHours = saleRepository.getSalesByHour(startOfDay, endOfDay)
                                .stream()
                                .map(row -> DashboardStats.HourlySale.builder()
                                                .hour(((Number) row[0]).intValue())
                                                .transactionCount(((Number) row[1]).longValue())
                                                .totalSales((BigDecimal) row[2])
                                                .build())
                                .collect(Collectors.toList());

                // Fetch recent 5 sales
                Pageable topFive = PageRequest.of(0, 5, Sort.by("createdAt").descending());
                List<SaleView> recentSales = saleRepository.findAll(topFive).getContent()
                                .stream()
                                .map(this::mapToSaleView)
                                .collect(Collectors.toList());

                // Phase 11: Category Analytics
                List<DashboardStats.CategoryAnalytic> categoryAnalytics = saleRepository
                                .getCategoryAnalytics(startOfMonth, endOfDay)
                                .stream()
                                .map(row -> DashboardStats.CategoryAnalytic.builder()
                                                .category((String) row[0])
                                                .totalQuantity(((Number) row[1]).longValue())
                                                .totalRevenue((BigDecimal) row[2])
                                                .totalProfit((BigDecimal) row[3])
                                                .build())
                                .collect(Collectors.toList());

                // Phase 11: Heat Map (Last 30 days)
                LocalDateTime startOfHeatMap = LocalDateTime.now().minusDays(30);
                List<DashboardStats.HeatMapPoint> heatMap = saleRepository.getSalesHeatMap(startOfHeatMap)
                                .stream()
                                .map(row -> DashboardStats.HeatMapPoint.builder()
                                                .dayOfWeek(((Number) row[0]).intValue())
                                                .hour(((Number) row[1]).intValue())
                                                .count(((Number) row[2]).longValue())
                                                .build())
                                .collect(Collectors.toList());

                // Phase 11: Store Health Score
                int healthScore = 100;
                healthScore -= Math.min(lowStockCount * 2, 30); // خصم للمخزون المنخفض

                long stagnantCount = customerRepository.findStagnantLoyalCustomers(LocalDateTime.now().minusDays(30))
                                .size();
                healthScore -= Math.min(stagnantCount * 3, 20); // خصم للعملاء الغائبين

                long expiringSoonCount = productRepository.findExpiringSoon(java.time.LocalDate.now().plusDays(7))
                                .size();
                healthScore -= Math.min(expiringSoonCount * 5, 20); // خصم للمنتجات القريبة من الانتهاء

                healthScore = Math.max(0, Math.min(100, healthScore));

                // Phase 12: Employee Leaderboard (This month)
                List<DashboardStats.EmployeePerformance> leaderboard = saleRepository
                                .getEmployeeLeaderboard(startOfMonth, endOfDay)
                                .stream()
                                .map(row -> DashboardStats.EmployeePerformance.builder()
                                                .userId((Long) row[0])
                                                .fullName((String) row[1])
                                                .transactionCount(((Number) row[2]).longValue())
                                                .totalSales((BigDecimal) row[3])
                                                .build())
                                .collect(Collectors.toList());

                return DashboardStats.builder()
                                .totalSalesToday(totalSalesToday)
                                .totalSalesThisMonth(totalSalesThisMonth)
                                .transactionCountToday(transactionCount)
                                .averageBasketSize(averageBasket)
                                .estimatedProfitToday(estimatedProfitToday)
                                .totalExpensesThisMonth(totalExpensesMonth)
                                .netProfitThisMonth(netProfitMonth)
                                .lowStockCount(lowStockCount)
                                .lowStockProducts(lowStockItems)
                                .topProducts(topProducts)
                                .dailySales(dailySales)
                                .peakHours(peakHours)
                                .recentSales(recentSales)
                                .categoryAnalytics(categoryAnalytics)
                                .heatMap(heatMap)
                                .storeHealthScore(healthScore)
                                .employeeLeaderboard(leaderboard)
                                .build();
        }

        private SaleView mapToSaleView(Sale sale) {
                return SaleView.builder()
                                .id(sale.getId())
                                .subtotal(sale.getSubtotal())
                                .discount(sale.getDiscount())
                                .total(sale.getTotal())
                                .paymentMethod(sale.getPaymentMethod())
                                .createdAt(sale.getCreatedAt())
                                .customer(sale.getCustomer() != null ? CustomerView.builder()
                                                .id(sale.getCustomer().getId())
                                                .name(sale.getCustomer().getName())
                                                .phone(sale.getCustomer().getPhone())
                                                .build() : null)
                                .build();
        }
}
