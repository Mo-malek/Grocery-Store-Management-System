package com.grocery.controller;

import com.grocery.entity.Product;
import com.grocery.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200", allowCredentials = "true")
public class ProductController {

    private final ProductService productService;

    @GetMapping
    public Page<Product> getAllProducts(
            @RequestParam(name = "search", required = false) String search,
            @PageableDefault(size = 20) Pageable pageable) {
        return productService.searchProducts(search, pageable);
    }

    @GetMapping("/{id}")
    public Product getProduct(@PathVariable("id") Long id) {
        return productService.getProduct(id);
    }

    @GetMapping("/barcode/{barcode}")
    public Product getByBarcode(@PathVariable("barcode") String barcode) {
        return productService.getByBarcode(barcode);
    }

    @PostMapping
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Product> createProduct(@Valid @RequestBody Product product) {
        return ResponseEntity.status(HttpStatus.CREATED).body(productService.createProduct(product));
    }

    @PutMapping("/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public Product updateProduct(@PathVariable("id") Long id, @Valid @RequestBody Product product) {
        return productService.updateProduct(id, product);
    }

    @DeleteMapping("/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Void> deleteProduct(@PathVariable("id") Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/adjust-stock")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public Product adjustStock(@PathVariable("id") Long id, @RequestBody java.util.Map<String, Object> adjustment) {
        int quantity = ((Number) adjustment.get("quantity")).intValue();
        String reason = (String) adjustment.get("reason");
        return productService.adjustStock(id, quantity, reason);
    }

    @GetMapping("/low-stock")
    public List<Product> getLowStockProducts() {
        return productService.getLowStockProducts();
    }

    @GetMapping("/categories")
    public List<String> getCategories() {
        return productService.getCategories();
    }

    @GetMapping("/expiring")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public List<Product> getExpiringProducts(@RequestParam(name = "days", defaultValue = "30") int days) {
        return productService.getExpiringProducts(days);
    }

    @GetMapping("/inventory-audit")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public List<com.grocery.dto.StockAuditReport> getInventoryAudit() {
        return productService.getInventoryAuditReport();
    }
}
