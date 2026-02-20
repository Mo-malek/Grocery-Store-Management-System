package com.grocery.controller;

import com.grocery.dto.StorefrontBundleDto;
import com.grocery.dto.StorefrontProductDto;
import com.grocery.dto.StorefrontReviewDto;
import com.grocery.service.BundleService;
import com.grocery.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/storefront")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200", allowCredentials = "true")
public class StorefrontController {

    private final ProductService productService;
    private final BundleService bundleService;
    private final com.grocery.repository.ReviewRepository reviewRepository;
    private final com.grocery.repository.ProductRepository productRepository;

    @GetMapping("/products")
    public Page<StorefrontProductDto> listProducts(
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "inStockOnly", defaultValue = "true") boolean inStockOnly,
            @RequestParam(value = "minPrice", required = false) java.math.BigDecimal minPrice,
            @RequestParam(value = "maxPrice", required = false) java.math.BigDecimal maxPrice,
            @RequestParam(value = "sort", required = false, defaultValue = "newest") String sort,
            @PageableDefault(size = 20) Pageable pageable) {

        // Build sort manually to control allowed fields
        org.springframework.data.domain.Sort sortSpec = switch (sort) {
            case "priceAsc" -> org.springframework.data.domain.Sort
                    .by(org.springframework.data.domain.Sort.Order.asc("selling_price"));
            case "priceDesc" -> org.springframework.data.domain.Sort
                    .by(org.springframework.data.domain.Sort.Order.desc("selling_price"));
            default ->
                org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Order.desc("created_at"));
        };
        Pageable p = org.springframework.data.domain.PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(),
                sortSpec);

        return productService.searchStorefront(search, category, inStockOnly, minPrice, maxPrice, p);
    }

    @GetMapping("/categories")
    public List<String> categories() {
        return productService.getCategories();
    }

    @GetMapping("/categories/counts")
    public List<com.grocery.dto.CategoryCountDto> categoryCounts() {
        return productService.getCategoryCounts();
    }

    @GetMapping("/products/{id}")
    public StorefrontProductDto getProduct(@PathVariable("id") Long id) {
        return StorefrontProductDto.fromEntity(productService.getProduct(id));
    }

    @GetMapping("/products/{id}/reviews")
    public List<StorefrontReviewDto> getReviews(@PathVariable("id") Long id) {
        return reviewRepository.findByProduct_IdOrderByCreatedAtDesc(id)
                .stream()
                .map(StorefrontReviewDto::fromEntity)
                .collect(Collectors.toList());
    }

    @GetMapping("/products/{id}/recommendations")
    public List<StorefrontProductDto> getRecommendations(@PathVariable("id") Long id) {
        com.grocery.entity.Product product = productService.getProduct(id);
        return productRepository.findTop4ByCategoryAndActiveTrueAndIdNot(product.getCategory(), id)
                .stream()
                .map(StorefrontProductDto::fromEntity)
                .collect(Collectors.toList());
    }

    @GetMapping("/offers")
    public List<StorefrontBundleDto> offers() {
        return bundleService.getActiveBundles()
                .stream()
                .map(StorefrontBundleDto::fromEntity)
                .collect(Collectors.toList());
    }
}
