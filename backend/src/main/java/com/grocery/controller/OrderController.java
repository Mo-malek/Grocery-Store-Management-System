package com.grocery.controller;

import com.grocery.entity.DeliveryOrder;
import com.grocery.entity.User;
import com.grocery.repository.UserRepository;
import com.grocery.service.DeliveryOrderService;
import com.grocery.dto.DeliveryOrderDto;
import com.grocery.dto.PlaceOrderRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class OrderController {

        private final DeliveryOrderService deliveryOrderService;
        private final UserRepository userRepository;

        @GetMapping("/pending")
        @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'CASHIER')")
        public List<DeliveryOrderDto> getPendingOrders() {
                return deliveryOrderService.getPendingOrders().stream()
                                .map(DeliveryOrderDto::fromEntity)
                                .collect(Collectors.toList());
        }

        @GetMapping("/all")
        @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
        public List<DeliveryOrderDto> getAllOrders() {
                return deliveryOrderService.getAllOrders().stream()
                                .map(DeliveryOrderDto::fromEntity)
                                .collect(Collectors.toList());
        }

        @GetMapping("/my")
        public List<DeliveryOrderDto> getMyOrders(@AuthenticationPrincipal UserDetails userDetails) {
                User customer = userRepository.findByUsername(userDetails.getUsername())
                                .orElseThrow(() -> new RuntimeException("User not found"));
                return deliveryOrderService.getCustomerOrders(customer).stream()
                                .map(DeliveryOrderDto::fromEntity)
                                .collect(Collectors.toList());
        }

        @GetMapping("/customer/{username}")
        @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'CASHIER')")
        public List<DeliveryOrderDto> getCustomerOrders(@PathVariable("username") String username) {
                User customer = userRepository.findByUsername(username)
                                .orElseThrow(() -> new RuntimeException("User not found"));
                return deliveryOrderService.getCustomerOrders(customer).stream()
                                .map(DeliveryOrderDto::fromEntity)
                                .collect(Collectors.toList());
        }

        @PutMapping("/{id}/status")
        @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'CASHIER')")
        public ResponseEntity<DeliveryOrderDto> updateStatus(@PathVariable("id") Long id,
                        @RequestParam("status") DeliveryOrder.DeliveryStatus status) {
                return ResponseEntity.ok(DeliveryOrderDto.fromEntity(deliveryOrderService.updateStatus(id, status)));
        }

        @PostMapping
        @PreAuthorize("hasRole('CUSTOMER')")
        public ResponseEntity<DeliveryOrderDto> placeOrder(@AuthenticationPrincipal UserDetails userDetails,
                        @Valid @RequestBody PlaceOrderRequest request) {
                User customer = userRepository.findByUsername(userDetails.getUsername())
                                .orElseThrow(() -> new RuntimeException("User not found"));
                return ResponseEntity.ok(DeliveryOrderDto.fromEntity(deliveryOrderService.createOrder(customer, request)));
        }
}
