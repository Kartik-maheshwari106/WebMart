package com.kartik.WebMart.controller;

import com.kartik.WebMart.model.OrderItem;
import com.kartik.WebMart.model.User;
import com.kartik.WebMart.model.ProfileUpdateRequest;
import com.kartik.WebMart.repository.OrderRepository;
import com.kartik.WebMart.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/seller")
public class SellerController {

    @Autowired private OrderRepository orderRepository;
    @Autowired private UserRepository userRepository;

    @GetMapping("/stats")
    public Map<String, Object> getSellerStats(@RequestAttribute("authenticatedEmail") String sellerEmail) {
        Double totalRevenue = orderRepository.getTotalRevenueBySeller(sellerEmail);
        Long totalSold = orderRepository.getTotalProductsSoldBySeller(sellerEmail);

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalRevenue", totalRevenue != null ? totalRevenue : 0.0);
        stats.put("totalProductsSold", totalSold != null ? totalSold : 0);
        return stats;
    }

    @GetMapping("/recent-sales")
    public List<OrderItem> getRecentSales(@RequestAttribute("authenticatedEmail") String sellerEmail) {
        return orderRepository.findRecentSalesBySeller(sellerEmail);
    }


    @PutMapping("/profile/update")
    public ResponseEntity<?> updateSellerProfile(
        @RequestAttribute("authenticatedEmail") String email,
        @RequestBody ProfileUpdateRequest request
    ) {
        Optional<User> userOpt = userRepository.findByEmail(email);

        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body("Error: Seller not found!");
        }

        User user = userOpt.get();


        if (request.getFullName() != null) user.setFullName(request.getFullName());
        if (request.getPhoneNumber() != null) user.setPhoneNumber(request.getPhoneNumber());
        if (request.getAddress() != null) user.setAddress(request.getAddress());
        

        if (request.getProfileImageUrl() != null && !request.getProfileImageUrl().trim().isEmpty()) {
            user.setProfileImageUrl(request.getProfileImageUrl());
        }


        User updatedUser = userRepository.save(user);
        return ResponseEntity.ok(updatedUser);
    }
}