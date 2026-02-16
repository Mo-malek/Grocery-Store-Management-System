package com.grocery.controller;

import com.grocery.dto.DashboardStats;
import com.grocery.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DashboardController {

    private final DashboardService dashboardService;

    /**
     * GET /api/dashboard/stats — جمع كل إحصائيات لوحة التحكم
     */
    @GetMapping("/stats")
    public DashboardStats getStats() {
        return dashboardService.getStats();
    }
}
