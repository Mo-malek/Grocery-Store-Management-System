package com.grocery.service;

import com.grocery.entity.Bundle;
import com.grocery.entity.BundleItem;
import com.grocery.entity.Product;
import com.grocery.repository.BundleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BundleService {

    private final BundleRepository bundleRepository;
    private final ProductService productService;

    public List<Bundle> getAllBundles() {
        return bundleRepository.findAll();
    }

    public List<Bundle> getActiveBundles() {
        return bundleRepository.findByActiveTrue();
    }

    @Transactional
    public Bundle createBundle(Bundle bundle) {
        // Associate items with the bundle
        if (bundle.getItems() != null) {
            for (BundleItem item : bundle.getItems()) {
                item.setBundle(bundle);
                // Ensure product is valid
                Product p = productService.getProduct(item.getProduct().getId());
                item.setProduct(p);
            }
        }
        return bundleRepository.save(bundle);
    }

    public BigDecimal calculatePotentialProfit(Bundle bundle) {
        BigDecimal totalCost = BigDecimal.ZERO;
        for (BundleItem item : bundle.getItems()) {
            Product p = productService.getProduct(item.getProduct().getId());
            totalCost = totalCost.add(p.getPurchasePrice().multiply(BigDecimal.valueOf(item.getQuantity())));
        }
        return bundle.getPrice().subtract(totalCost);
    }

    @Transactional
    public void deleteBundle(Long id) {
        bundleRepository.deleteById(id);
    }
}
