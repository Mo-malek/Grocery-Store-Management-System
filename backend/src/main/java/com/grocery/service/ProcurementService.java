package com.grocery.service;

import com.grocery.dto.ReorderSuggestion;
import com.grocery.dto.PriceOptimizationSuggestion;
import com.grocery.entity.Product;
import com.grocery.repository.ProductRepository;
import com.grocery.repository.SaleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProcurementService {

    private final ProductRepository productRepository;
    private final SaleRepository saleRepository;

    public List<ReorderSuggestion> getReorderSuggestions() {
        // Velocity based on last 30 days
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        List<Object[]> salesData = saleRepository.getProductSalesSince(thirtyDaysAgo);

        Map<Long, Long> velocityMap = salesData.stream()
                .collect(Collectors.toMap(
                        data -> (Long) data[0],
                        data -> (Long) data[1]));

        List<Product> products = productRepository.findAll();
        List<ReorderSuggestion> suggestions = new ArrayList<>();

        for (Product product : products) {
            Long totalQtySold = velocityMap.getOrDefault(product.getId(), 0L);
            double dailyVelocity = totalQtySold / 30.0;

            Double daysUntilOut = null;
            if (dailyVelocity > 0) {
                daysUntilOut = product.getCurrentStock() / dailyVelocity;
            }

            Integer suggestedQty = 0;
            if (daysUntilOut != null && daysUntilOut < 7) {
                suggestedQty = (int) Math.ceil(dailyVelocity * 14);
            } else if (product.isLowStock() && dailyVelocity == 0) {
                suggestedQty = product.getMinStock() * 2;
            }

            if (suggestedQty > 0 || (daysUntilOut != null && daysUntilOut < 10)) {
                suggestions.add(ReorderSuggestion.builder()
                        .productId(product.getId())
                        .productName(product.getName())
                        .currentStock(product.getCurrentStock())
                        .dailyVelocity(Math.round(dailyVelocity * 100.0) / 100.0)
                        .daysUntilOut(daysUntilOut != null ? Math.round(daysUntilOut * 10.0) / 10.0 : null)
                        .suggestedReorderQuantity(suggestedQty)
                        .unit(product.getUnit())
                        .build());
            }
        }

        return suggestions.stream()
                .sorted((a, b) -> {
                    if (a.getDaysUntilOut() == null)
                        return 1;
                    if (b.getDaysUntilOut() == null)
                        return -1;
                    return a.getDaysUntilOut().compareTo(b.getDaysUntilOut());
                })
                .collect(Collectors.toList());
    }

    public List<PriceOptimizationSuggestion> getPriceOptimizationSuggestions() {
        List<Product> products = productRepository.findByActiveTrue();
        List<PriceOptimizationSuggestion> suggestions = new ArrayList<>();
        LocalDate today = LocalDate.now();
        LocalDateTime fifteenDaysAgo = LocalDateTime.now().minusDays(15);

        List<Object[]> salesData = saleRepository.getProductSalesSince(fifteenDaysAgo);
        Map<Long, Long> velocityMap = salesData.stream()
                .collect(Collectors.toMap(d -> (Long) d[0], d -> (Long) d[1]));

        for (Product product : products) {
            if (product.getCurrentStock() <= 0)
                continue;

            // 1. Expiry Risk
            if (product.getExpiryDate() != null) {
                long daysToExpiry = ChronoUnit.DAYS.between(today, product.getExpiryDate());
                if (daysToExpiry < 15) {
                    BigDecimal discount = product.getSellingPrice().multiply(BigDecimal.valueOf(0.25));
                    suggestions.add(PriceOptimizationSuggestion.builder()
                            .productId(product.getId())
                            .productName(product.getName())
                            .currentStock(product.getCurrentStock())
                            .currentPrice(product.getSellingPrice())
                            .suggestedPrice(
                                    product.getSellingPrice().subtract(discount).setScale(2, RoundingMode.HALF_UP))
                            .reason("EXPIRING_SOON")
                            .message("تنتهي الصلاحية خلال " + daysToExpiry + " يوم. نقترح خصم 25% لتصريف الكمية.")
                            .build());
                    continue;
                }
            }

            // 2. Slow Moving
            Long salesIn15Days = velocityMap.getOrDefault(product.getId(), 0L);
            if (salesIn15Days == 0 && product.getCurrentStock() > product.getMinStock()) {
                BigDecimal discount = product.getSellingPrice().multiply(BigDecimal.valueOf(0.10));
                suggestions.add(PriceOptimizationSuggestion.builder()
                        .productId(product.getId())
                        .productName(product.getName())
                        .currentStock(product.getCurrentStock())
                        .currentPrice(product.getSellingPrice())
                        .suggestedPrice(product.getSellingPrice().subtract(discount).setScale(2, RoundingMode.HALF_UP))
                        .reason("SLOW_MOVING")
                        .message("لم يتم بيع أي قطعة خلال 15 يوم. نقترح خصم 10% لتنشيط البيع.")
                        .build());
            }
        }
        return suggestions;
    }
}
