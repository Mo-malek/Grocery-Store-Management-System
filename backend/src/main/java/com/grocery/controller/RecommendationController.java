package com.grocery.controller;

import com.grocery.dto.RecommendationSuggestion;
import com.grocery.service.RecommendationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recommendations")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200", allowCredentials = "true")
public class RecommendationController {

    private final RecommendationService recommendationService;

    @GetMapping("/basket")
    public List<RecommendationSuggestion> getBasketSuggestions(
            @RequestParam(name = "productIds") List<Long> productIds) {
        return recommendationService.getBasketSuggestions(productIds);
    }
}
