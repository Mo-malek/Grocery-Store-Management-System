package com.grocery.repository;

import com.grocery.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    Optional<Product> findByBarcode(String barcode);

    List<Product> findByCategory(String category);

    List<Product> findByActiveTrue();

    Page<Product> findByActiveTrue(Pageable pageable);

    List<Product> findByActiveTrueAndExpiryDateBefore(java.time.LocalDate date);

    // البحث بالاسم أو الباركود
    @Query("SELECT p FROM Product p WHERE p.active = true AND (LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) OR p.barcode LIKE CONCAT('%', :search, '%'))")
    List<Product> searchProducts(@Param("search") String search);

    // البحث بالاسم أو الباركود مع الترقيم
    @Query("SELECT p FROM Product p WHERE p.active = true AND (LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) OR p.barcode LIKE CONCAT('%', :search, '%'))")
    Page<Product> searchProducts(@Param("search") String search, Pageable pageable);

    // المنتجات تحت الحد الأدنى
    @Query("SELECT p FROM Product p WHERE p.active = true AND p.currentStock <= p.minStock")
    List<Product> findLowStockProducts();

    // الفئات المتاحة
    @Query("SELECT DISTINCT p.category FROM Product p WHERE p.category IS NOT NULL")
    List<String> findDistinctCategories();

    @Query("SELECT p FROM Product p WHERE p.active = true AND p.expiryDate <= :date")
    List<Product> findExpiringSoon(@Param("date") java.time.LocalDate date);
}
