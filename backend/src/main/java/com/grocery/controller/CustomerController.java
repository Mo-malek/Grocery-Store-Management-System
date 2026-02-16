package com.grocery.controller;

import com.grocery.entity.Customer;
import com.grocery.dto.SaleView;
import com.grocery.service.CustomerService;
import com.grocery.service.SaleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CustomerController {

    private final CustomerService customerService;
    private final SaleService saleService;

    @GetMapping
    public List<Customer> getAllCustomers(@RequestParam(name = "search", required = false) String search) {
        return customerService.searchCustomers(search);
    }

    @GetMapping("/{id}")
    public Customer getCustomer(@PathVariable("id") Long id) {
        return customerService.getCustomer(id);
    }

    @PostMapping
    public ResponseEntity<Customer> createCustomer(@Valid @RequestBody Customer customer) {
        return ResponseEntity.status(HttpStatus.CREATED).body(customerService.createCustomer(customer));
    }

    @PutMapping("/{id}")
    public Customer updateCustomer(@PathVariable("id") Long id, @Valid @RequestBody Customer customer) {
        return customerService.updateCustomer(id, customer);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCustomer(@PathVariable("id") Long id) {
        customerService.deleteCustomer(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/history")
    public List<SaleView> getCustomerHistory(@PathVariable("id") Long id) {
        return saleService.getCustomerSales(id);
    }

    @GetMapping("/top")
    public List<Customer> getTopCustomers() {
        return customerService.getTopCustomers();
    }

    @GetMapping("/stagnant")
    public List<Customer> getStagnantCustomers() {
        return customerService.getStagnantCustomers();
    }
}
