package com.grocery.controller;

import com.grocery.dto.PriceOptimizationSuggestion;
import com.grocery.dto.ReorderSuggestion;
import com.grocery.service.ProcurementService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/procurement")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200", allowCredentials = "true")
public class ProcurementController {

    private final ProcurementService procurementService;

    @GetMapping("/suggestions")
    @PreAuthorize("hasRole('MANAGER')")
    public List<ReorderSuggestion> getReorderSuggestions() {
        return procurementService.getReorderSuggestions();
    }

    @GetMapping("/optimizations")
    @PreAuthorize("hasRole('MANAGER')")
    public List<PriceOptimizationSuggestion> getPriceOptimizationSuggestions() {
        return procurementService.getPriceOptimizationSuggestions();
    }
}
