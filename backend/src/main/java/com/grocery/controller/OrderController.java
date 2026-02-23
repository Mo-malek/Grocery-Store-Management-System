package com.grocery.controller;

import com.grocery.entity.DeliveryOrder;
import com.grocery.entity.User;
import com.grocery.repository.UserRepository;
import com.grocery.service.DeliveryOrderService;
import com.grocery.service.NotificationService;
import com.grocery.dto.DeliveryOrderDto;
import com.grocery.dto.NotificationRequest;
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
        private final NotificationService notificationService;

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
                DeliveryOrder order = deliveryOrderService.updateStatus(id, status);

                if (order.getCustomer() != null) {
                        notificationService.sendToUser(order.getCustomer(), NotificationRequest.builder()
                                        .title("Order Update")
                                        .body("Your order #" + order.getId() + " is now " + status)
                                        .data(java.util.Map.of("orderId", String.valueOf(order.getId())))
                                        .build());
                }

                return ResponseEntity.ok(DeliveryOrderDto.fromEntity(order));
        }

        @PostMapping
        @PreAuthorize("hasRole('CUSTOMER')")
        public ResponseEntity<DeliveryOrderDto> placeOrder(@AuthenticationPrincipal UserDetails userDetails,
                        @Valid @RequestBody PlaceOrderRequest request) {
                User customer = userRepository.findByUsername(userDetails.getUsername())
                                .orElseThrow(() -> new RuntimeException("User not found"));
                DeliveryOrder order = deliveryOrderService.createOrder(customer, request);

                // Notify Admins and Managers
                NotificationRequest adminNotification = NotificationRequest.builder()
                                .title("New Order Received")
                                .body("Order #" + order.getId() + " was placed by " + customer.getUsername())
                                .data(java.util.Map.of("orderId", String.valueOf(order.getId())))
                                .build();

                notificationService.sendToRole("ROLE_ADMIN", adminNotification);
                notificationService.sendToRole("ROLE_MANAGER", adminNotification);

                return ResponseEntity.ok(DeliveryOrderDto.fromEntity(order));
        }
}
