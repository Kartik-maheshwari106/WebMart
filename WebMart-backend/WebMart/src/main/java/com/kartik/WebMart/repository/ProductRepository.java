package com.kartik.WebMart.repository;

import com.kartik.WebMart.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import jakarta.transaction.Transactional;
import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {


    List<Product> findBySellerId(Long sellerId);


    @Query("SELECT p FROM Product p WHERE LOWER(p.name) LIKE LOWER(CONCAT('%', :name, '%')) AND p.seller IS NOT NULL")
    List<Product> findActiveByName(@Param("name") String name);


    @Query("SELECT p FROM Product p WHERE LOWER(p.category) = LOWER(:category) AND p.seller IS NOT NULL")
    List<Product> findActiveByCategory(@Param("category") String category);


    @Query("SELECT p FROM Product p WHERE p.price BETWEEN :minPrice AND :maxPrice AND p.seller IS NOT NULL")
    List<Product> findActiveByPriceRange(@Param("minPrice") double minPrice, @Param("maxPrice") double maxPrice);


    @Query("SELECT p FROM Product p WHERE p.seller IS NOT NULL")
    List<Product> findAllActiveProducts();


    @Modifying
    @Transactional
    @Query("UPDATE Product p SET p.seller = null WHERE p.seller.id = :sellerId")
    void unsetSellerFromProducts(@Param("userId") Long sellerId);
}