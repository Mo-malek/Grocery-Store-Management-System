package com.grocery.repository;

import com.grocery.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

        Optional<Product> findByBarcode(String barcode);

        List<Product> findByCategory(String category);

        List<Product> findByActiveTrue();

        Page<Product> findByActiveTrue(Pageable pageable);

        List<Product> findByActiveTrueAndExpiryDateBefore(java.time.LocalDate date);

        // البحث بالاسم أو الباركود
        @Query(value = """
                        SELECT * FROM product p
                         WHERE p.active = true
                           AND (
                             COALESCE(CAST(:search AS text), '') = ''
                             OR p.name ILIKE CONCAT('%', CAST(:search AS text), '%')
                             OR COALESCE(p.barcode, '') ILIKE CONCAT('%', CAST(:search AS text), '%')
                           )
                        """, nativeQuery = true)
        List<Product> searchProducts(@Param("search") String search);

        // البحث بالاسم أو الباركود مع الترقيم
        @Query(value = """
                        SELECT * FROM product p
                         WHERE p.active = true
                           AND (
                             COALESCE(CAST(:search AS text), '') = ''
                             OR p.name ILIKE CONCAT('%', CAST(:search AS text), '%')
                             OR COALESCE(p.barcode, '') ILIKE CONCAT('%', CAST(:search AS text), '%')
                           )
                        """, countQuery = """
                        SELECT count(*) FROM product p
                         WHERE p.active = true
                           AND (
                             COALESCE(CAST(:search AS text), '') = ''
                             OR p.name ILIKE CONCAT('%', CAST(:search AS text), '%')
                             OR COALESCE(p.barcode, '') ILIKE CONCAT('%', CAST(:search AS text), '%')
                           )
                        """, nativeQuery = true)
        Page<Product> searchProducts(@Param("search") String search, Pageable pageable);

        // المنتجات تحت الحد الأدنى
        @Query("SELECT p FROM Product p WHERE p.active = true AND p.currentStock <= p.minStock")
        List<Product> findLowStockProducts();

        // الفئات المتاحة
        @Query("SELECT DISTINCT p.category FROM Product p WHERE p.category IS NOT NULL")
        List<String> findDistinctCategories();

        @Query("SELECT p FROM Product p WHERE p.active = true AND p.expiryDate <= :date")
        List<Product> findExpiringSoon(@Param("date") java.time.LocalDate date);

        @Query(value = """
                        SELECT * FROM product p
                         WHERE p.active = true
                           AND (:inStockOnly = false OR p.current_stock > 0)
                           AND (:category IS NULL OR p.category = :category)
                           AND (COALESCE(CAST(:search AS text), '') = '' OR p.name ILIKE CONCAT('%', CAST(:search AS text), '%') OR COALESCE(p.barcode, '') ILIKE CONCAT('%', CAST(:search AS text), '%'))
                           AND (:minPrice IS NULL OR p.selling_price >= :minPrice)
                           AND (:maxPrice IS NULL OR p.selling_price <= :maxPrice)
                        """, countQuery = """
                        SELECT count(*) FROM product p
                         WHERE p.active = true
                           AND (:inStockOnly = false OR p.current_stock > 0)
                           AND (:category IS NULL OR p.category = :category)
                           AND (COALESCE(CAST(:search AS text), '') = '' OR p.name ILIKE CONCAT('%', CAST(:search AS text), '%') OR COALESCE(p.barcode, '') ILIKE CONCAT('%', CAST(:search AS text), '%'))
                           AND (:minPrice IS NULL OR p.selling_price >= :minPrice)
                           AND (:maxPrice IS NULL OR p.selling_price <= :maxPrice)
                        """, nativeQuery = true)
        Page<Product> searchStorefront(@Param("search") String search,
                        @Param("category") String category,
                        @Param("inStockOnly") boolean inStockOnly,
                        @Param("minPrice") java.math.BigDecimal minPrice,
                        @Param("maxPrice") java.math.BigDecimal maxPrice,
                        Pageable pageable);

        @Query(value = "SELECT p.category as category, COUNT(*) as cnt FROM product p WHERE p.active = true GROUP BY p.category", nativeQuery = true)
        List<Object[]> categoryCounts();

        List<Product> findTop4ByCategoryAndActiveTrueAndIdNot(String category, Long id);
}
