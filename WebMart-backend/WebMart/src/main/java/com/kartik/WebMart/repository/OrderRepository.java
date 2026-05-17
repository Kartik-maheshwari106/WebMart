package com.kartik.WebMart.repository;

import com.kartik.WebMart.model.Order;
import com.kartik.WebMart.model.User;
import com.kartik.WebMart.model.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional; // Standard import
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByUser(User user);

    List<Order> findByUserId(Long userId);

    @Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.status = 'DELIVERED'")
    Double getDeliveredRevenue();
    
    @Query("SELECT COALESCE(SUM(oi.quantity * oi.priceAtPurchase), 0.0) FROM OrderItem oi " +
           "WHERE oi.product.seller.email = :sellerEmail AND oi.order.status != 'CANCELLED'")
    Double getTotalRevenueBySeller(@Param("sellerEmail") String sellerEmail);

    @Query("SELECT COALESCE(SUM(oi.quantity), 0) FROM OrderItem oi " +
           "WHERE oi.product.seller.email = :sellerEmail AND oi.order.status != 'CANCELLED'")
    Long getTotalProductsSoldBySeller(@Param("sellerEmail") String sellerEmail);

    @Query("SELECT oi FROM OrderItem oi WHERE oi.product.seller.email = :sellerEmail ORDER BY oi.order.orderDate DESC")
    List<OrderItem> findRecentSalesBySeller(@Param("sellerEmail") String sellerEmail);

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0.0) FROM Order o WHERE o.status != 'CANCELLED'")
    Double getTotalPlatformRevenue();

    @Query("SELECT COALESCE(SUM(oi.quantity), 0) FROM OrderItem oi WHERE oi.order.status != 'CANCELLED'")
    Long getTotalGlobalProductsSold();

    @Query("SELECT o FROM Order o ORDER BY o.orderDate DESC")
    List<Order> findRecentGlobalOrders();
    
    List<Order> findByStatus(String status);



    @Modifying
    @Transactional
    @Query("UPDATE Order o SET o.user = null WHERE o.user.id = :userId")
    void unsetUserFromOrders(@Param("userId") Long userId);
}