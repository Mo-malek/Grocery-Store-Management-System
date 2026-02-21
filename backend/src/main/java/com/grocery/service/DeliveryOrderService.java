package com.grocery.service;

import com.grocery.dto.PlaceOrderRequest;
import com.grocery.entity.DeliveryOrder;
import com.grocery.entity.DeliveryOrderItem;
import com.grocery.entity.Product;
import com.grocery.entity.Sale;
import com.grocery.entity.SaleItem;
import com.grocery.entity.User;
import com.grocery.repository.DeliveryOrderRepository;
import com.grocery.repository.ProductRepository;
import com.grocery.repository.SaleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DeliveryOrderService {

    private final DeliveryOrderRepository deliveryOrderRepository;
    private final ProductRepository productRepository;
    private final SaleRepository saleRepository;
    private final StockLogService stockLogService;

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
            stockLogService.logChange(p, -i.getQuantity(), "ONLINE_ORDER", "Order checkout (online)");

            BigDecimal unitPrice = calculateEffectivePrice(p.getSellingPrice(), p.getDiscountPercentage());

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

        DeliveryOrder savedOrder = deliveryOrderRepository.save(order);
        createLinkedOnlineSale(savedOrder, request.getFullName());
        return savedOrder;
    }

    public List<DeliveryOrder> getCustomerOrders(User user) {
        return deliveryOrderRepository.findByCustomerOrderByCreatedAtDesc(user);
    }

    private void createLinkedOnlineSale(DeliveryOrder order, String fallbackCustomerName) {
        BigDecimal itemsSubtotal = order.getItems().stream()
                .map(it -> it.getPriceAtTimeOfOrder().multiply(BigDecimal.valueOf(it.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Sale sale = Sale.builder()
                .subtotal(itemsSubtotal)
                .discount(BigDecimal.ZERO)
                .total(order.getTotalAmount())
                .paymentMethod("CASH")
                .saleChannel("ONLINE")
                .sourceOrderId(order.getId())
                .externalCustomerName(
                        (fallbackCustomerName != null && !fallbackCustomerName.isBlank())
                                ? fallbackCustomerName
                                : (order.getCustomer() != null ? order.getCustomer().getFullName() : null))
                .externalCustomerPhone(order.getPhone())
                .externalCustomerAddress(order.getAddress())
                .createdAt(order.getCreatedAt())
                .items(new ArrayList<>())
                .build();

        for (DeliveryOrderItem orderItem : order.getItems()) {
            SaleItem saleItem = SaleItem.builder()
                    .product(orderItem.getProduct())
                    .quantity(orderItem.getQuantity())
                    .unitPrice(orderItem.getPriceAtTimeOfOrder())
                    .total(orderItem.getPriceAtTimeOfOrder().multiply(BigDecimal.valueOf(orderItem.getQuantity())))
                    .build();
            sale.addItem(saleItem);
        }

        saleRepository.save(sale);
    }

    private BigDecimal calculateEffectivePrice(BigDecimal sellingPrice, BigDecimal discountPercentage) {
        if (sellingPrice == null) {
            return BigDecimal.ZERO;
        }
        BigDecimal discount = normalizeDiscount(discountPercentage);
        if (discount.compareTo(BigDecimal.ZERO) <= 0) {
            return sellingPrice;
        }
        BigDecimal ratio = BigDecimal.ONE.subtract(discount.divide(BigDecimal.valueOf(100), 6, RoundingMode.HALF_UP));
        return sellingPrice.multiply(ratio).setScale(2, RoundingMode.HALF_UP);
    }

    private BigDecimal normalizeDiscount(BigDecimal discountPercentage) {
        if (discountPercentage == null) {
            return BigDecimal.ZERO;
        }
        return discountPercentage.max(BigDecimal.ZERO).min(BigDecimal.valueOf(100));
    }
}
