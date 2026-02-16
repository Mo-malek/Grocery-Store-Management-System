package com.grocery.service;

import com.grocery.dto.RecommendationSuggestion;
import com.grocery.entity.Product;
import com.grocery.repository.SaleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RecommendationService {

    private final SaleRepository saleRepository;
    private final ProductService productService;

    public List<RecommendationSuggestion> getBasketSuggestions(List<Long> currentProductIds) {
        if (currentProductIds == null || currentProductIds.isEmpty()) {
            return List.of();
        }

        List<Object[]> data = saleRepository.getFrequentlyBoughtWith(currentProductIds);

        return data.stream()
                .limit(4) // Show top 4 suggestions
                .map(row -> {
                    Long id = (Long) row[0];
                    String name = (String) row[1];
                    Long freq = (Long) row[2];

                    Product p = productService.getProduct(id);

                    return RecommendationSuggestion.builder()
                            .productId(id)
                            .productName(name)
                            .frequency(freq)
                            .category(p.getCategory())
                            .price(p.getSellingPrice().doubleValue())
                            .build();
                })
                .collect(Collectors.toList());
    }
}
