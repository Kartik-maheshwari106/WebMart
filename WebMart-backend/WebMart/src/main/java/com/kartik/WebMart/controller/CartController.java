package com.kartik.WebMart.controller;

import com.kartik.WebMart.model.Cart;

import com.kartik.WebMart.model.Product;
import com.kartik.WebMart.model.User;
import com.kartik.WebMart.repository.CartRepository;
import com.kartik.WebMart.repository.ProductRepository;
import com.kartik.WebMart.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.*;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;


    @PostMapping("/add")
    public ResponseEntity<?> addToCart(
            @RequestAttribute("authenticatedEmail") String email, 
            @RequestBody Map<String, Object> payload) {
        
    	
    	Long productId = Long.valueOf(payload.get("productId").toString());
        int quantity = Integer.parseInt(payload.get("quantity").toString());
        
        Optional<User> userOpt = userRepository.findByEmail(email);
        Optional<Product> productOpt = productRepository.findById(productId);

        if (userOpt.isEmpty()) return ResponseEntity.status(404).body("Error: User not found!");
        if (productOpt.isEmpty()) return ResponseEntity.status(404).body("Error: Product not found!");

        User user = userOpt.get();
        Product product = productOpt.get();

        if (product.getStock() < quantity) {
            return ResponseEntity.status(400).body("Error: Not enough stock! Available: " + product.getStock());
        }

        Optional<Cart> existingCartItem = cartRepository.findByUserAndProductId(user, productId);
        
        if (existingCartItem.isPresent()) {
            Cart cartItem = existingCartItem.get();
            cartItem.setQuantity(cartItem.getQuantity() + quantity);
            cartRepository.save(cartItem);
        } else {
            Cart newCartItem = new Cart(user, product, quantity);
            cartRepository.save(newCartItem);
        }

        return ResponseEntity.ok("Success: " + product.getName() + " added to cart!");
    }


    @GetMapping("/view")
    public ResponseEntity<?> viewCart(@RequestAttribute("authenticatedEmail") String email) {

        Optional<User> userOpt = userRepository.findByEmail(email);
        
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body("Error: User not found!");
        }


        List<Cart> cartItems = cartRepository.findByUser(userOpt.get());

        if (cartItems.isEmpty()) {

            return ResponseEntity.ok(cartItems); 
        }


        return ResponseEntity.ok(cartItems);
    }
    
    

    @DeleteMapping("/remove/{cartId}")
    public ResponseEntity<?> removeFromCart(@PathVariable Long cartId) {
        if (cartRepository.existsById(cartId)) {
            cartRepository.deleteById(cartId);
            return ResponseEntity.ok("Success: Item removed from cart.");
        }
        return ResponseEntity.status(404).body("Error: Item not found in cart.");
    }


    @GetMapping("/summary")
    public ResponseEntity<?> getCartSummary(@RequestAttribute("authenticatedEmail") String email) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) return ResponseEntity.status(404).body("User not found");

        List<Cart> cartItems = cartRepository.findByUser(userOpt.get());
        double grandTotal = cartItems.stream()
                .mapToDouble(item -> item.getProduct().getPrice() * item.getQuantity())
                .sum();

        return ResponseEntity.ok("Your Cart Total: ₹" + grandTotal);
    }


    @PutMapping("/update-quantity")
    public ResponseEntity<?> updateQuantity(
            @RequestAttribute("authenticatedEmail") String email, 
            @RequestBody Map<String, Object> payload) {
    	
    	Long productId = Long.valueOf(payload.get("productId").toString());
        int newQuantity = Integer.parseInt(payload.get("newQuantity").toString());
        
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) return ResponseEntity.status(404).body("Error: User not found!");

        Optional<Cart> cartOpt = cartRepository.findByUserAndProductId(userOpt.get(), productId);

        if (cartOpt.isPresent()) {
            Cart item = cartOpt.get();
            if (newQuantity <= 0) {
                cartRepository.delete(item);
                return ResponseEntity.ok("Success: Item removed from cart.");
            }
            if (item.getProduct().getStock() < newQuantity) {
                return ResponseEntity.status(400).body("Error: Only " + item.getProduct().getStock() + " units in stock!");
            }
            item.setQuantity(newQuantity);
            cartRepository.save(item);
            return ResponseEntity.ok("Success: Quantity updated to " + newQuantity);
        }
        return ResponseEntity.status(404).body("Error: Item not found in your cart.");
    }
}