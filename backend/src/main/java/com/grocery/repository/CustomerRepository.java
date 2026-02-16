package com.grocery.repository;

import com.grocery.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {

    Optional<Customer> findByPhone(String phone);

    // البحث بالاسم أو الرقم
    @Query("SELECT c FROM Customer c WHERE LOWER(c.name) LIKE LOWER(CONCAT('%', :search, '%')) OR c.phone LIKE CONCAT('%', :search, '%')")
    List<Customer> searchCustomers(@Param("search") String search);

    // أفضل العملاء حسب إجمالي المشتريات
    List<Customer> findTop10ByOrderByTotalPurchasesDesc();

    // عملاء لم يزوروا منذ فترة (مثلاً 30 يوم) ولكن لديهم تاريخ شراء قوي
    @Query("SELECT c FROM Customer c WHERE c.lastVisitAt < :date AND c.visitCount >= 3 ORDER BY c.lastVisitAt ASC")
    List<Customer> findStagnantLoyalCustomers(@Param("date") java.time.LocalDateTime date);
}
