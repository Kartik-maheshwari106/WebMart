package com.kartik.WebMart.controller;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.kartik.WebMart.model.Cart;
import com.kartik.WebMart.model.Order;
import com.kartik.WebMart.model.OrderItem;
import com.kartik.WebMart.model.Product;
import com.kartik.WebMart.model.User;
import com.kartik.WebMart.repository.CartRepository;
import com.kartik.WebMart.repository.OrderRepository;
import com.kartik.WebMart.repository.ProductRepository;
import com.kartik.WebMart.repository.UserRepository;
import com.kartik.WebMart.service.EmailService;

import jakarta.transaction.Transactional;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired private EmailService emailService;
    @Autowired private OrderRepository orderRepository;
    @Autowired private CartRepository cartRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private ProductRepository productRepository;


    @Value("${BOSS_EMAIL}")
    private String BOSS_EMAIL;


    @GetMapping("/all")
    public ResponseEntity<?> getAllOrders(@RequestAttribute("authenticatedEmail") String adminEmail) {
        Optional<User> adminOpt = userRepository.findByEmail(adminEmail);
        

        if (adminOpt.isEmpty() || 
           (adminOpt.get().getRole().equalsIgnoreCase("BUYER") && !adminEmail.equalsIgnoreCase(BOSS_EMAIL))) {
            return ResponseEntity.status(403).body("Error: Unauthorized Access to Order Registry!");
        }

        List<Order> orders = orderRepository.findAll();
        

        List<Map<String, Object>> response = orders.stream().map(order -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", order.getId());
            map.put("customer", order.getUser().getFullName());
            map.put("email", order.getUser().getEmail());
            map.put("date", order.getOrderDate());
            map.put("total", order.getTotalAmount());
            map.put("status", order.getStatus());
            map.put("itemsCount", order.getItems().size());
            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }



    @PostMapping("/place")
    @Transactional
    public ResponseEntity<?> placeOrder(
            @RequestAttribute("authenticatedEmail") String email, 
            @RequestBody Map<String, String> payload) {
    	
    	String address = payload.get("address");
        String paymentMethod = payload.get("paymentMethod");
        
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) return ResponseEntity.status(404).body("Error: User not found!");
        
        User user = userOpt.get();
        List<Cart> cartItems = cartRepository.findByUser(user);
        
        if (cartItems.isEmpty()) return ResponseEntity.status(400).body("Error: Your cart is empty!");

        double totalAmount = 0;
        for (Cart item : cartItems) {
            if (item.getProduct().getStock() < item.getQuantity()) {
                return ResponseEntity.status(400).body("Error: " + item.getProduct().getName() + " is out of stock!");
            }
            totalAmount += item.getProduct().getPrice() * item.getQuantity();
        }

        Order order = new Order();
        order.setUser(user);
        order.setTotalAmount(totalAmount);
        order.setOrderDate(LocalDateTime.now());
        order.setStatus("PENDING");
        order.setDeliveryAddress(address);
        order.setPaymentMethod(paymentMethod);

        List<OrderItem> orderItems = new ArrayList<>();
        for (Cart cartItem : cartItems) {
            Product product = cartItem.getProduct();
            product.setStock(product.getStock() - cartItem.getQuantity());
            productRepository.save(product);

            OrderItem orderItem = new OrderItem(order, product, cartItem.getQuantity(), product.getPrice());
            orderItems.add(orderItem);
        }
        
        order.setItems(orderItems);
        orderRepository.save(order);
        cartRepository.deleteAll(cartItems);

        String emailBody = "Hello " + user.getFullName() + ",\n\n" +
                           "Thank you for shopping at WebMart! Your order has been placed successfully.\n" +
                           "Order ID: " + order.getId() + "\n" +
                           "Total Amount: ₹" + totalAmount + "\n" +
                           "Status: " + order.getStatus() + "\n\n" +
                           "We will notify you once your items are shipped!";

        try {
            emailService.sendEmail(user.getEmail(), "Order Confirmed - WebMart", emailBody);
        } catch (Exception e) {
            System.out.println("Email Error: " + e.getMessage());
        }

        return ResponseEntity.ok("Success! Order placed. Order ID: " + order.getId());
    }

    @GetMapping("/history")
    public ResponseEntity<?> getOrderHistory(@RequestAttribute("authenticatedEmail") String email) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) return ResponseEntity.status(404).body("Error: User not found!");

        List<Order> orders = orderRepository.findByUser(userOpt.get());
        if (orders.isEmpty()) return ResponseEntity.ok(new java.util.ArrayList<>());

        List<java.util.Map<String, Object>> response = orders.stream().map(order -> {
            java.util.Map<String, Object> orderMap = new java.util.HashMap<>();
            orderMap.put("orderId", order.getId());
            orderMap.put("status", order.getStatus());
            orderMap.put("totalAmount", order.getTotalAmount());
            orderMap.put("orderDate", order.getOrderDate());
            orderMap.put("address", order.getDeliveryAddress());
            orderMap.put("payment", order.getPaymentMethod());

            List<java.util.Map<String, Object>> itemsList = order.getItems().stream().map(item -> {
                java.util.Map<String, Object> itemMap = new java.util.HashMap<>();
                itemMap.put("productId", item.getProduct().getId());
                itemMap.put("productName", item.getProduct().getName());
                itemMap.put("quantity", item.getQuantity());
                itemMap.put("priceAtPurchase", item.getPriceAtPurchase());
                return itemMap;
            }).collect(java.util.stream.Collectors.toList());

            orderMap.put("items", itemsList);
            return orderMap;
        }).collect(java.util.stream.Collectors.toList());

        return ResponseEntity.ok(response);
    }

    @PutMapping("/update-status/{orderId}")
    public ResponseEntity<?> updateOrderStatus(
            @PathVariable Long orderId, 
            @RequestBody Map<String, String> payload, 
            @RequestAttribute("authenticatedEmail") String adminEmail) {
    	
    	String newStatus = payload.get("newStatus");

        Optional<User> adminOpt = userRepository.findByEmail(adminEmail);
        if (adminOpt.isEmpty() || (adminOpt.get().getRole().equalsIgnoreCase("BUYER") && !adminEmail.equalsIgnoreCase(BOSS_EMAIL))) {
            return ResponseEntity.status(403).body("Error: Only Staff can update tracking status!");
        }

        Optional<Order> orderOpt = orderRepository.findById(orderId);
        if (orderOpt.isPresent()) {
            Order order = orderOpt.get();
            String oldStatus = order.getStatus();
            
            order.setStatus(newStatus.toUpperCase());
            orderRepository.save(order);
            
            if (!oldStatus.equalsIgnoreCase(newStatus)) {
                String customerEmail = order.getUser().getEmail();
                String subject = "Order Update - #" + orderId + " [" + newStatus.toUpperCase() + "]";
                String body = "Hello " + order.getUser().getFullName() + ",\n\n" +
                              "Your order #" + orderId + " is " + newStatus.toUpperCase() + ".";
                try {
                    emailService.sendEmail(customerEmail, subject, body);
                } catch (Exception e) {
                    System.out.println("Email Error: " + e.getMessage());
                }
            }
            return ResponseEntity.ok("Order " + orderId + " is now " + newStatus);
        }
        return ResponseEntity.status(404).body("Error: Order not found.");
    }

    @PutMapping("/cancel/{orderId}")
    @Transactional
    public ResponseEntity<?> cancelOrder(@PathVariable Long orderId, @RequestAttribute("authenticatedEmail") String email) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        Optional<Order> orderOpt = orderRepository.findById(orderId);

        if (userOpt.isEmpty() || orderOpt.isEmpty()) return ResponseEntity.status(404).body("Error: User or Order not found!");

        User user = userOpt.get();
        Order order = orderOpt.get();

        if (!order.getUser().getEmail().equals(email) && !user.getRole().equalsIgnoreCase("ADMIN") && !email.equalsIgnoreCase(BOSS_EMAIL)) {
            return ResponseEntity.status(403).body("Error: Not authorized!");
        }

        if (user.getRole().equalsIgnoreCase("BUYER") && !order.getStatus().equalsIgnoreCase("PENDING")) {
            return ResponseEntity.status(403).body("Error: Cannot cancel order once it is " + order.getStatus());
        }

        for (OrderItem item : order.getItems()) {
            Product product = item.getProduct();
            product.setStock(product.getStock() + item.getQuantity());
            productRepository.save(product);
        }

        order.setStatus("CANCELLED");
        orderRepository.save(order);
        
        return ResponseEntity.ok("Success: Order #" + orderId + " has been cancelled.");
    }
}