package com.grocery.repository;

import com.grocery.entity.BundleItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BundleItemRepository extends JpaRepository<BundleItem, Long> {
}
