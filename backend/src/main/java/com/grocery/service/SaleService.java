package com.grocery.service;

import com.grocery.dto.SaleItemRequest;
import com.grocery.dto.SaleRequest;
import com.grocery.entity.*;
import com.grocery.repository.SaleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import com.grocery.dto.SaleView;
import com.grocery.dto.CustomerView;
import java.util.stream.Collectors;
import java.math.RoundingMode;
import org.springframework.security.core.context.SecurityContextHolder;

@Service
@RequiredArgsConstructor
public class SaleService {

    private final SaleRepository saleRepository;
    private final ProductService productService;
    private final CustomerService customerService;
    private final StockLogService stockLogService;
    private final com.grocery.repository.BundleRepository bundleRepository;
    private final com.grocery.repository.UserRepository userRepository;

    /**
     * إنشاء فاتورة بيع جديدة (عملية البيع الأساسية)
     * 1. يتأكد من توفر الكميات
     * 2. يخصم من المخزون
     * 3. يحسب الإجمالي
     * 4. يحدث نقاط ولاء العميل
     */
    @Transactional
    public SaleView createSale(SaleRequest request) {
        Sale sale = Sale.builder().build();

        // ربط الكاشير (المستخدم الحالي)
        try {
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            userRepository.findByUsername(username).ifPresent(sale::setCashier);
        } catch (Exception e) {
            // Log or fallback if no auth context (e.g. testing)
        }

        // ربط العميل (اختياري)
        if (request.getCustomerId() != null) {
            Customer customer = customerService.getCustomer(request.getCustomerId());
            sale.setCustomer(customer);
        }

        // التأكد من وجود أصناف أو عروض
        boolean hasItems = request.getItems() != null && !request.getItems().isEmpty();
        boolean hasBundles = request.getBundleIds() != null && !request.getBundleIds().isEmpty();

        if (!hasItems && !hasBundles) {
            throw new RuntimeException("الفاتورة يجب أن تحتوي على صنف واحد على الأقل أو عرض واحد");
        }

        // إضافة الأصناف
        BigDecimal subtotal = BigDecimal.ZERO;
        if (hasItems) {
            for (SaleItemRequest itemReq : request.getItems()) {
                Product product = productService.getProduct(itemReq.getProductId());

                SaleItem item = SaleItem.builder()
                        .product(product)
                        .quantity(itemReq.getQuantity())
                        .unitPrice(product.getSellingPrice())
                        .build();
                item.calculateTotal();
                sale.addItem(item);

                subtotal = subtotal.add(item.getTotal());

                // خصم المخزون
                productService.deductStock(product.getId(), itemReq.getQuantity());

                // تسجيل حركة المخزون
                stockLogService.logChange(product, -itemReq.getQuantity(), "SALE",
                        "فاتورة رقم: " + (sale.getId() != null ? sale.getId() : "جديدة"));
            }
        }

        // إضافة العروض (Bundles)
        if (hasBundles) {
            for (Long bundleId : request.getBundleIds()) {
                Bundle bundle = bundleRepository.findById(bundleId)
                        .orElseThrow(() -> new RuntimeException("العرض غير موجود: " + bundleId));

                for (BundleItem bItem : bundle.getItems()) {
                    Product product = bItem.getProduct();

                    SaleItem saleItem = SaleItem.builder()
                            .product(product)
                            .bundle(bundle)
                            .quantity(bItem.getQuantity())
                            .unitPrice(BigDecimal.ZERO) // السعر مسجل في رأس العرض أو موزع
                            .total(BigDecimal.ZERO)
                            .build();
                    sale.addItem(saleItem);

                    // خصم المخزون
                    productService.deductStock(product.getId(), bItem.getQuantity());

                    // تسجيل حركة المخزون
                    stockLogService.logChange(product, -bItem.getQuantity(), "SALE_BUNDLE",
                            "فاتورة رقم: " + (sale.getId() != null ? sale.getId() : "جديدة") + " - عرض: "
                                    + bundle.getName());
                }
                subtotal = subtotal.add(bundle.getPrice());
            }
        }

        // حساب الإجمالي
        sale.setSubtotal(subtotal);
        BigDecimal discount = request.getDiscount() != null ? request.getDiscount() : BigDecimal.ZERO;
        sale.setDiscount(discount);
        sale.setTotal(subtotal.subtract(discount));
        sale.setPaymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod() : "CASH");

        Sale savedSale = saleRepository.save(sale);

        // تحديث مشتريات ونقاط العميل + الذكاء التجاري
        if (savedSale.getCustomer() != null) {
            Customer customer = savedSale.getCustomer();
            BigDecimal saleTotal = savedSale.getTotal();

            // 1. تحديث إجمالي المشتريات
            customer.setTotalPurchases(customer.getTotalPurchases().add(saleTotal));

            // 2. تحديث نقاط الولاء (نقطة لكل 10 جنيهات)
            int newPoints = saleTotal.divide(BigDecimal.valueOf(10), RoundingMode.FLOOR).intValue();
            customer.setLoyaltyPoints(customer.getLoyaltyPoints() + newPoints);

            // 3. الذكاء التجاري: التردد والمتوسط
            customer.setLastVisitAt(LocalDateTime.now());
            int newVisitCount = (customer.getVisitCount() != null ? customer.getVisitCount() : 0) + 1;
            customer.setVisitCount(newVisitCount);

            // حساب متوسط السلة الجديد
            BigDecimal currentAvg = customer.getAvgTicketSize() != null ? customer.getAvgTicketSize() : BigDecimal.ZERO;
            BigDecimal newAvg = currentAvg.multiply(BigDecimal.valueOf(newVisitCount - 1))
                    .add(saleTotal)
                    .divide(BigDecimal.valueOf(newVisitCount), 2, RoundingMode.HALF_UP);
            customer.setAvgTicketSize(newAvg);

            // تحديد الفئة المفضلة (تبسيط: فئة آخر منتج غالي)
            if (!savedSale.getItems().isEmpty()) {
                String topCategory = savedSale.getItems().get(0).getProduct().getCategory();
                customer.setFavoriteCategory(topCategory);
            }
        }

        return mapToSaleView(savedSale);
    }

    public SaleView getSale(Long id) {
        Sale sale = saleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("الفاتورة غير موجودة: " + id));
        return mapToSaleView(sale);
    }

    public List<SaleView> getTodaySales() {
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = LocalDate.now().atTime(LocalTime.MAX);
        return saleRepository.findByCreatedAtBetweenOrderByCreatedAtDesc(startOfDay, endOfDay)
                .stream()
                .map(this::mapToSaleView)
                .collect(Collectors.toList());
    }

    public List<SaleView> getSalesByDateRange(LocalDate from, LocalDate to) {
        return saleRepository.findByCreatedAtBetweenOrderByCreatedAtDesc(
                from.atStartOfDay(),
                to.atTime(LocalTime.MAX))
                .stream()
                .map(this::mapToSaleView)
                .collect(Collectors.toList());
    }

    public List<SaleView> getCustomerSales(Long customerId) {
        return saleRepository.findByCustomerIdOrderByCreatedAtDesc(customerId)
                .stream()
                .map(this::mapToSaleView)
                .collect(Collectors.toList());
    }

    private SaleView mapToSaleView(Sale sale) {
        return SaleView.builder()
                .id(sale.getId())
                .subtotal(sale.getSubtotal())
                .discount(sale.getDiscount())
                .total(sale.getTotal())
                .paymentMethod(sale.getPaymentMethod())
                .createdAt(sale.getCreatedAt())
                .customer(sale.getCustomer() != null ? CustomerView.builder()
                        .id(sale.getCustomer().getId())
                        .name(sale.getCustomer().getName())
                        .phone(sale.getCustomer().getPhone())
                        .totalPurchases(sale.getCustomer().getTotalPurchases())
                        .loyaltyPoints(sale.getCustomer().getLoyaltyPoints())
                        .build() : null)
                .items(sale.getItems().stream().map(item -> SaleView.SaleItemView.builder()
                        .id(item.getId())
                        .productId(item.getProduct().getId())
                        .productName(item.getProduct().getName())
                        .quantity(item.getQuantity())
                        .unitPrice(item.getUnitPrice())
                        .total(item.getTotal())
                        .build()).collect(Collectors.toList()))
                .build();
    }
}
