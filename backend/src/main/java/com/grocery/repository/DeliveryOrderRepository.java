package com.grocery.repository;

import com.grocery.entity.DeliveryOrder;
import com.grocery.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DeliveryOrderRepository extends JpaRepository<DeliveryOrder, Long> {
    List<DeliveryOrder> findAllByOrderByCreatedAtDesc();

    List<DeliveryOrder> findByCustomerOrderByCreatedAtDesc(User customer);

    List<DeliveryOrder> findByStatusOrderByCreatedAtDesc(DeliveryOrder.DeliveryStatus status);
}
