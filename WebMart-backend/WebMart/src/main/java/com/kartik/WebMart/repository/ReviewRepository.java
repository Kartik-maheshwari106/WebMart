package com.kartik.WebMart.repository;

import com.kartik.WebMart.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import jakarta.transaction.Transactional;
import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    

    List<Review> findByProductId(Long productId);


    @Modifying
    @Transactional
    @Query("DELETE FROM Review r WHERE r.userEmail = :email")
    void deleteByUserEmail(@Param("email") String email);
}