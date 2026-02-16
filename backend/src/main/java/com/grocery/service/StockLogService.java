package com.grocery.service;

import com.grocery.entity.Product;
import com.grocery.entity.StockLog;
import com.grocery.repository.StockLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class StockLogService {
    private final StockLogRepository stockLogRepository;

    @Transactional
    public void logChange(Product product, int quantityChange, String type, String reason) {
        StockLog log = StockLog.builder()
                .product(product)
                .quantityChange(quantityChange)
                .type(type)
                .reason(reason)
                .build();
        stockLogRepository.save(log);
    }
}
