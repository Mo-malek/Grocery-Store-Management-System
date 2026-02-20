package com.grocery.service;

import com.grocery.dto.PlaceOrderRequest;
import com.grocery.entity.DeliveryOrder;
import com.grocery.entity.DeliveryOrderItem;
import com.grocery.entity.Product;
import com.grocery.entity.User;
import com.grocery.repository.DeliveryOrderRepository;
import com.grocery.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DeliveryOrderService {

    private final DeliveryOrderRepository deliveryOrderRepository;
    private final ProductRepository productRepository;

    public List<DeliveryOrder> getPendingOrders() {
        return deliveryOrderRepository.findByStatusOrderByCreatedAtDesc(DeliveryOrder.DeliveryStatus.PENDING);
    }

    public List<DeliveryOrder> getAllOrders() {
        return deliveryOrderRepository.findAllByOrderByCreatedAtDesc();
    }

    @Transactional
    public DeliveryOrder updateStatus(Long orderId, DeliveryOrder.DeliveryStatus status) {
        DeliveryOrder order = deliveryOrderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        order.setStatus(status);
        return deliveryOrderRepository.save(order);
    }

    @Transactional
    public DeliveryOrder createOrder(User customer, PlaceOrderRequest request) {
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new RuntimeException("Order must contain at least one item");
        }

        DeliveryOrder order = DeliveryOrder.builder()
                .customer(customer)
                .address(request.getAddress())
                .phone(request.getPhone())
                .deliveryFee(BigDecimal.ZERO)
                .status(DeliveryOrder.DeliveryStatus.PENDING)
                .build();

        List<DeliveryOrderItem> items = request.getItems().stream().map(i -> {
            if (i.getQuantity() == null || i.getQuantity() <= 0) {
                throw new RuntimeException("Invalid quantity for product: " + i.getProductId());
            }
            Product p = productRepository.findById(i.getProductId())
                    .orElseThrow(() -> new RuntimeException("Product not found: " + i.getProductId()));

            if (!Boolean.TRUE.equals(p.getActive())) {
                throw new RuntimeException("Product is inactive: " + p.getName());
            }
            if (p.getCurrentStock() < i.getQuantity()) {
                throw new RuntimeException("Insufficient stock for product: " + p.getName());
            }
            p.setCurrentStock(p.getCurrentStock() - i.getQuantity());
            productRepository.save(p);

            // TODO: apply discount pricing rules if you want storefront discounts to affect checkout totals.
            BigDecimal unitPrice = p.getSellingPrice();

            return DeliveryOrderItem.builder()
                    .order(order)
                    .product(p)
                    .quantity(i.getQuantity())
                    .priceAtTimeOfOrder(unitPrice)
                    .build();
        }).collect(Collectors.toList());

        order.setItems(items);

        BigDecimal total = items.stream()
                .map(it -> it.getPriceAtTimeOfOrder().multiply(BigDecimal.valueOf(it.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        order.setTotalAmount(total.add(order.getDeliveryFee()));

        return deliveryOrderRepository.save(order);
    }

    public List<DeliveryOrder> getCustomerOrders(User user) {
        return deliveryOrderRepository.findByCustomerOrderByCreatedAtDesc(user);
    }
}
