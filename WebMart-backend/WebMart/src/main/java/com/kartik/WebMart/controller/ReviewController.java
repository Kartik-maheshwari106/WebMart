package com.kartik.WebMart.controller;

import com.kartik.WebMart.model.Review;
import com.kartik.WebMart.model.User;
import com.kartik.WebMart.repository.ReviewRepository;
import com.kartik.WebMart.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity; // 🚩 Ye zaroori hai
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private UserRepository userRepository;


    @PostMapping("/add")
    public ResponseEntity<?> addReview(
            @RequestBody Review review, 
            @RequestAttribute("authenticatedEmail") String userEmail) {
        

        Optional<User> userOpt = userRepository.findByEmail(userEmail);
        
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body("Error: User session invalid or not found!");
        }

        User user = userOpt.get();


        review.setUserEmail(userEmail); 
        review.setUserName(user.getFullName()); 


        if (review.getRating() < 1 || review.getRating() > 5) {
            return ResponseEntity.status(400).body("Error: Rating must be between 1 and 5 stars!");
        }


        Review savedReview = reviewRepository.save(review);
        return ResponseEntity.ok(savedReview); 
    }


    @GetMapping("/product/{productId}")
    public ResponseEntity<List<Review>> getProductReviews(@PathVariable Long productId) {
        List<Review> reviews = reviewRepository.findByProductId(productId);
        

        reviews.forEach(r -> r.setUserEmail("Confidential")); 
        

        return ResponseEntity.ok(reviews);
    }


    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteReview(
            @PathVariable Long id, 
            @RequestAttribute("authenticatedEmail") String email) {
        
        Optional<Review> reviewOpt = reviewRepository.findById(id);
        
        if (reviewOpt.isEmpty()) {
            return ResponseEntity.status(404).body("Error: Review not found!");
        }
        
        Review review = reviewOpt.get();
        

        if (!review.getUserEmail().equalsIgnoreCase(email)) {
            return ResponseEntity.status(403).body("Error: Permission denied! You can only delete your own reviews.");
        }
        
        reviewRepository.deleteById(id);
        return ResponseEntity.ok("Success: Review deleted!");
    }
}