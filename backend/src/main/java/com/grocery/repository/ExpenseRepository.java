package com.grocery.repository;

import com.grocery.entity.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    @Query("SELECT SUM(e.amount) FROM Expense e WHERE e.createdAt BETWEEN :start AND :end")
    BigDecimal getTotalExpensesBetween(LocalDateTime start, LocalDateTime end);
}
