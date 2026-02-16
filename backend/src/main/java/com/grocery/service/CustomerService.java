package com.grocery.service;

import com.grocery.entity.Customer;
import com.grocery.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomerService {

    private final CustomerRepository customerRepository;

    public List<Customer> getAllCustomers() {
        return customerRepository.findAll();
    }

    public Customer getCustomer(Long id) {
        return customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("العميل غير موجود: " + id));
    }

    public List<Customer> searchCustomers(String search) {
        if (search == null || search.isBlank()) {
            return getAllCustomers();
        }
        return customerRepository.searchCustomers(search);
    }

    @Transactional
    public Customer createCustomer(Customer customer) {
        // التأكد من عدم تكرار رقم الموبايل
        if (customer.getPhone() != null) {
            customerRepository.findByPhone(customer.getPhone()).ifPresent(existing -> {
                throw new RuntimeException("رقم الموبايل مسجل بالفعل للعميل: " + existing.getName());
            });
        }
        return customerRepository.save(customer);
    }

    @Transactional
    public Customer updateCustomer(Long id, Customer updated) {
        Customer existing = getCustomer(id);
        existing.setName(updated.getName());
        existing.setPhone(updated.getPhone());
        return customerRepository.save(existing);
    }

    @Transactional
    public void deleteCustomer(Long id) {
        customerRepository.deleteById(id);
    }

    public List<Customer> getTopCustomers() {
        return customerRepository.findTop10ByOrderByTotalPurchasesDesc();
    }

    public List<Customer> getStagnantCustomers() {
        java.time.LocalDateTime threshold = java.time.LocalDateTime.now().minusDays(30);
        return customerRepository.findStagnantLoyalCustomers(threshold);
    }
}
