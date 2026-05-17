package com.kartik.WebMart.controller;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired; // 🚩 Added
import org.springframework.beans.factory.annotation.Value; // 🚩 Added
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.kartik.WebMart.model.User;
import com.kartik.WebMart.repository.CartRepository;
import com.kartik.WebMart.repository.OrderRepository;
import com.kartik.WebMart.repository.ProductRepository;
import com.kartik.WebMart.repository.ReviewRepository;
import com.kartik.WebMart.repository.UserRepository;
import com.kartik.WebMart.service.EmailService;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasAnyAuthority('ADMIN', 'DEVELOPER')") 
public class AdminController {

    @Autowired private OrderRepository orderRepository;
    @Autowired private ProductRepository productRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private CartRepository cartRepository; // 🚩 Injected
    @Autowired private ReviewRepository reviewRepository; // 🚩 Injected
    @Autowired private EmailService emailService; 

    @Value("${BOSS_EMAIL}")
    private String BOSS_EMAIL;


    @GetMapping("/stats")
    public ResponseEntity<?> getDashboardStats() {
        try {
            Map<String, Object> stats = new HashMap<>();
            stats.put("totalProducts", productRepository.count());
            stats.put("totalOrders", orderRepository.count());
            stats.put("totalUsers", userRepository.count());
            
            Double deliveredRevenue = orderRepository.getDeliveredRevenue();
            stats.put("totalRevenue", deliveredRevenue != null ? deliveredRevenue : 0.0);
            
            List<Map<String, Object>> chartData = new ArrayList<>();
            chartData.add(Map.of("name", "Mon", "revenue", 2400));
            chartData.add(Map.of("name", "Tue", "revenue", 1398));
            chartData.add(Map.of("name", "Wed", "revenue", 9800));
            chartData.add(Map.of("name", "Thu", "revenue", 3908));
            chartData.add(Map.of("name", "Fri", "revenue", deliveredRevenue != null ? deliveredRevenue : 4800));
            
            stats.put("chartData", chartData);
            stats.put("growth", Map.of("products", 12, "orders", 18, "users", 5, "revenue", 8));
            
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }


    @GetMapping("/users/all")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @PutMapping("/users/{id}/role")
    public ResponseEntity<?> updateUserRole(
            @PathVariable Long id, 
            @RequestBody Map<String, String> payload,
            @RequestAttribute("authenticatedEmail") String requesterEmail) {
        
        String newRole = payload.get("role").toUpperCase();
        if ((newRole.equals("ADMIN") || newRole.equals("DEVELOPER")) && !requesterEmail.equalsIgnoreCase(BOSS_EMAIL)) {
            return ResponseEntity.status(403).body("Error: Only the System Boss can assign Admin/Developer roles!");
        }

        return userRepository.findById(id).map(user -> {
            user.setRole(newRole);
            userRepository.save(user);
            return ResponseEntity.ok("Success: User " + user.getEmail() + " updated to " + newRole);
        }).orElse(ResponseEntity.status(404).body("Error: User not found!"));
    }

    @PutMapping("/users/{id}/status")
    public ResponseEntity<?> toggleUserStatus(
            @PathVariable Long id, 
            @RequestBody Map<String, String> payload) {
        
        String newStatus = payload.get("status").toUpperCase(); 
        return userRepository.findById(id).map(user -> {
            if (user.getEmail().equalsIgnoreCase(BOSS_EMAIL)) {
                return ResponseEntity.status(400).body("Error: System Boss cannot be blocked!");
            }
            user.setAccountStatus(newStatus);
            userRepository.save(user);

            String subject = "Account Status Update - WebMart";
            String message = "Hello " + user.getFullName() + ",\n\n" +
                             "Your account status has been updated to: " + newStatus + ".\n" +
                             (newStatus.equals("BLOCKED") ? "You can no longer access your account. Contact support if this is a mistake." : "You can now log in to your account.") + 
                             "\n\nRegards,\nWebMart Admin Team";
            emailService.sendEmail(user.getEmail(), subject, message);

            return ResponseEntity.ok("Success: User account is now " + newStatus);
        }).orElse(ResponseEntity.status(404).body("Error: User not found."));
    }


    @GetMapping("/inspect/orders/{userId}")
    public ResponseEntity<?> getCustomerOrders(@PathVariable Long userId) {
        return ResponseEntity.ok(orderRepository.findByUserId(userId));
    }

    @GetMapping("/inspect/products/{userId}")
    public ResponseEntity<?> getSellerProducts(@PathVariable Long userId) {
        return ResponseEntity.ok(productRepository.findBySellerId(userId));
    }


    @Transactional  
    @DeleteMapping("/users/remove/{id}")
    public ResponseEntity<?> removeUser(
            @PathVariable Long id, 
            @RequestAttribute("authenticatedEmail") String requesterEmail) {
    	System.out.println("DEBUG: Requester Email is -> " + requesterEmail);
    	System.out.println("Requester: " + requesterEmail + " | Target ID: " + id);
        if (!requesterEmail.equalsIgnoreCase(BOSS_EMAIL)) {
            return ResponseEntity.status(403).body("Error: Only the System Boss can delete accounts!");
        }

        return userRepository.findById(id).map(targetUser -> {
            if (targetUser.getEmail().equalsIgnoreCase(BOSS_EMAIL)) {
                return ResponseEntity.status(400).body("Error: System Boss account cannot be deleted!");
            }

            try {
                String userEmail = targetUser.getEmail();
                String userName = targetUser.getFullName();
                String userRole = targetUser.getRole().toUpperCase();


                if (userRole.contains("SELLER")) {
                    productRepository.unsetSellerFromProducts(id);
                }


                cartRepository.deleteByUserId(id);


                reviewRepository.deleteByUserEmail(userEmail);


                orderRepository.unsetUserFromOrders(id);


                productRepository.flush();
                cartRepository.flush();
                reviewRepository.flush();
                orderRepository.flush();


                userRepository.delete(targetUser);


                String subject = "Account Terminated - WebMart";
                String message = "Hello " + userName + ",\n\n" +
                                 "Your WebMart account has been removed by the administrator.\n" +
                                 (userRole.contains("SELLER") ? "All your listed products have been removed." : "Your past order history has been archived.") + 
                                 "\n\nRegards,\nWebMart Admin Team";
                emailService.sendEmail(userEmail, subject, message);
                
                return ResponseEntity.ok("Success: User and all associated data cleared.");

            } catch (Exception e) {
                e.printStackTrace(); 
                return ResponseEntity.status(500).body("Deletion Failed: " + e.getMessage());
            }
        }).orElse(ResponseEntity.status(404).body("Error: User not found."));
    }


    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> getSystemHealth() {
        Map<String, String> health = new HashMap<>();
        health.put("database", "Optimal");
        health.put("auth_service", "Secure");
        health.put("developer_mode", "Active");
        return ResponseEntity.ok(health);
    }
}