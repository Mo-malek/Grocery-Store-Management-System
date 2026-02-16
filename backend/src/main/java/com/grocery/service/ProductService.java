package com.grocery.service;

import com.grocery.dto.StockAuditReport;
import com.grocery.entity.Product;
import com.grocery.repository.ProductRepository;
import com.grocery.repository.StockLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final StockLogService stockLogService;
    private final StockLogRepository stockLogRepository;

    public List<Product> getAllProducts() {
        return productRepository.findByActiveTrue();
    }

    public Product getProduct(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("المنتج غير موجود: " + id));
    }

    public Product getByBarcode(String barcode) {
        return productRepository.findByBarcode(barcode)
                .orElseThrow(() -> new RuntimeException("المنتج غير موجود بالباركود: " + barcode));
    }

    public List<Product> searchProducts(String search) {
        if (search == null || search.isBlank()) {
            return getAllProducts();
        }
        return productRepository.searchProducts(search);
    }

    @Transactional
    public Product createProduct(Product product) {
        return productRepository.save(product);
    }

    @Transactional
    public Product updateProduct(Long id, Product updated) {
        Product existing = getProduct(id);
        existing.setName(updated.getName());
        existing.setBarcode(updated.getBarcode());
        existing.setCategory(updated.getCategory());
        existing.setPurchasePrice(updated.getPurchasePrice());
        existing.setSellingPrice(updated.getSellingPrice());
        existing.setCurrentStock(updated.getCurrentStock());
        existing.setMinStock(updated.getMinStock());
        existing.setUnit(updated.getUnit());
        existing.setExpiryDate(updated.getExpiryDate());
        existing.setManufacturer(updated.getManufacturer());
        return productRepository.save(existing);
    }

    public List<Product> getExpiringProducts(int days) {
        java.time.LocalDate limit = java.time.LocalDate.now().plusDays(days);
        return productRepository.findByActiveTrueAndExpiryDateBefore(limit);
    }

    @Transactional
    public void deleteProduct(Long id) {
        Product product = getProduct(id);
        product.setActive(false); // Soft delete
        productRepository.save(product);
    }

    public List<Product> getLowStockProducts() {
        return productRepository.findLowStockProducts();
    }

    public List<String> getCategories() {
        return productRepository.findDistinctCategories();
    }

    @Transactional
    public void deductStock(Long productId, int quantity) {
        Product product = getProduct(productId);
        if (product.getCurrentStock() < quantity) {
            throw new RuntimeException("الكمية المطلوبة (" + quantity + ") أكبر من المتوفر ("
                    + product.getCurrentStock() + ") للمنتج: " + product.getName());
        }
        product.setCurrentStock(product.getCurrentStock() - quantity);
        productRepository.save(product);
    }

    @Transactional
    public Product adjustStock(Long productId, int quantity, String reason) {
        Product product = getProduct(productId);
        product.setCurrentStock(product.getCurrentStock() + quantity);
        Product saved = productRepository.save(product);

        String type = quantity > 0 ? "RESTOCK" : "ADJUSTMENT";
        stockLogService.logChange(product, quantity, type, reason);

        return saved;
    }

    public List<StockAuditReport> getInventoryAuditReport() {
        return stockLogRepository.getAuditSummary().stream()
                .map(row -> {
                    Long sold = ((Number) row[2]).longValue();
                    Long loss = ((Number) row[3]).longValue();
                    double lossRate = (sold + loss) > 0 ? (loss.doubleValue() / (sold + loss)) * 100 : 0;
                    return StockAuditReport.builder()
                            .productId((Long) row[0])
                            .productName((String) row[1])
                            .totalSold(sold)
                            .totalManualLoss(loss)
                            .lossRate(lossRate)
                            .build();
                })
                .filter(report -> report.getLossRate() > 2.0)
                .collect(Collectors.toList());
    }
}
