package com.kartik.WebMart.repository;

import com.kartik.WebMart.model.Cart;
import com.kartik.WebMart.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import jakarta.transaction.Transactional;
import java.util.List;
import java.util.Optional;

public interface CartRepository extends JpaRepository<Cart, Long> {

    List<Cart> findByUser(User user);


    Optional<Cart> findByUserAndProductId(User user, Long productId);


    @Modifying
    @Transactional
    @Query("DELETE FROM Cart c WHERE c.user.id = :userId")
    void deleteByUserId(@Param("userId") Long userId);
}