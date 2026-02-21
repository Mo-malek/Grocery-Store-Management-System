package com.grocery.controller;

import com.grocery.entity.Bundle;
import com.grocery.service.BundleService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/bundles")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200", allowCredentials = "true")
public class BundleController {

    private final BundleService bundleService;

    @GetMapping
    public List<Bundle> getAllBundles() {
        return bundleService.getAllBundles();
    }

    @GetMapping("/active")
    public List<Bundle> getActiveBundles() {
        return bundleService.getActiveBundles();
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public Bundle createBundle(@RequestBody Bundle bundle) {
        return bundleService.createBundle(bundle);
    }

    @GetMapping("/{id}/profit")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public BigDecimal getBundleProfit(@PathVariable("id") Long id) {
        // In a real app, you'd fetch the bundle first
        return BigDecimal.ZERO; // Simplified for now
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public void deleteBundle(@PathVariable("id") Long id) {
        bundleService.deleteBundle(id);
    }
}
