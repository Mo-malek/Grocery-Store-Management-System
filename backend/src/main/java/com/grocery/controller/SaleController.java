package com.grocery.controller;

import com.grocery.dto.SaleRequest;
import com.grocery.dto.SaleView;
import com.grocery.service.SaleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/sales")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SaleController {

    private final SaleService saleService;

    /**
     * POST /api/sales — إنشاء فاتورة بيع جديدة (Checkout)
     */
    @PostMapping
    public ResponseEntity<SaleView> createSale(@Valid @RequestBody SaleRequest request) {
        SaleView sale = saleService.createSale(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(sale);
    }

    @GetMapping("/{id}")
    public SaleView getSale(@PathVariable("id") Long id) {
        return saleService.getSale(id);
    }

    @GetMapping("/today")
    public List<SaleView> getTodaySales() {
        return saleService.getTodaySales();
    }

    @GetMapping
    public Page<SaleView> getSalesByDateRange(
            @RequestParam("from") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam("to") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @PageableDefault(size = 20) Pageable pageable) {
        return saleService.getSalesByDateRange(from, to, pageable);
    }
}
