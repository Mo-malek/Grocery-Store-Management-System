package com.grocery.repository;

import com.grocery.entity.FcmToken;
import com.grocery.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FcmTokenRepository extends JpaRepository<FcmToken, Long> {
    List<FcmToken> findByUser(User user);

    Optional<FcmToken> findByToken(String token);

    @jakarta.transaction.Transactional
    @org.springframework.data.jpa.repository.Modifying
    void deleteByToken(String token);

    List<FcmToken> findByUserRole(String role);
}
