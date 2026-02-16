package com.grocery.service;

import com.grocery.entity.Expense;
import com.grocery.repository.ExpenseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ExpenseService {
    private final ExpenseRepository expenseRepository;

    public List<Expense> getAllExpenses() {
        return expenseRepository.findAll();
    }

    @Transactional
    public Expense addExpense(Expense expense) {
        return expenseRepository.save(expense);
    }

    @Transactional
    public void deleteExpense(Long id) {
        expenseRepository.deleteById(id);
    }
}
