package com.grocery.repository;

import com.grocery.entity.AppNotification;
import com.grocery.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AppNotificationRepository extends JpaRepository<AppNotification, Long> {
    List<AppNotification> findByUserOrderByCreatedAtDesc(User user);

    List<AppNotification> findByUserAndIsReadFalseOrderByCreatedAtDesc(User user);

    long countByUserAndIsReadFalse(User user);
}
