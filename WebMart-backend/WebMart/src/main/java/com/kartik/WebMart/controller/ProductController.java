package com.kartik.WebMart.controller;

import com.kartik.WebMart.model.Product;
import com.kartik.WebMart.model.User;
import com.kartik.WebMart.repository.ProductRepository;
import com.kartik.WebMart.repository.UserRepository;
import com.kartik.WebMart.model.Review;
import com.kartik.WebMart.repository.ReviewRepository;
import com.kartik.WebMart.service.FileUploadService;
import com.kartik.WebMart.service.EmailService; 
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.*;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    @Autowired private ProductRepository productRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private ReviewRepository reviewRepository;
    @Autowired private FileUploadService fileUploadService;
    @Autowired private EmailService emailService; 


    @PostMapping(value = "/add", consumes = {"multipart/form-data"})
    public ResponseEntity<?> addProduct(
            @ModelAttribute Product product, 
            @RequestParam(value = "files", required = false) MultipartFile[] files,
            @RequestAttribute("authenticatedEmail") String email) {
        
        try {
            Optional<User> userOptional = userRepository.findByEmail(email);
            if (userOptional.isPresent()) {
                User sellerUser = userOptional.get();
                String role = sellerUser.getRole().toUpperCase();
                
                if (role.contains("SELLER") || role.contains("ADMIN") || role.contains("DEVELOPER")) {
                    List<String> finalImageUrls = new ArrayList<>();
                    if (files != null && files.length > 0) {
                        for (MultipartFile file : files) {
                            if (file != null && !file.isEmpty()) {
                                String url = fileUploadService.uploadFile(file);
                                if (url != null) finalImageUrls.add(url);
                            }
                        }
                    }

                    if (finalImageUrls.size() > 5) return ResponseEntity.badRequest().body("Error: Max 5 images allowed!!");

                    product.setImageUrls(finalImageUrls.isEmpty() ? "" : String.join(",", finalImageUrls));
                    product.setSeller(sellerUser); 
                    product.setSellerEmail(sellerUser.getEmail());
                    
                    if (role.contains("ADMIN") || role.contains("DEVELOPER")) {
                        product.setSellerName("WebMart");
                    } else {
                        product.setSellerName(sellerUser.getCompanyName());
                    }
                    
                    productRepository.save(product);
                    return ResponseEntity.ok("Success: Product listed successfully!");
                }
                return ResponseEntity.status(403).body("Error: Access Denied!");
            }
            return ResponseEntity.status(404).body("Error: User not found.");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error during upload: " + e.getMessage());
        }
    }


    @PutMapping(value = "/update/{id}", consumes = {"multipart/form-data"})
    public ResponseEntity<?> updateProduct(
            @PathVariable Long id, 
            @ModelAttribute Product updatedProduct, 
            @RequestParam(value = "files", required = false) MultipartFile[] files,
            @RequestParam(value = "images", required = false) List<String> existingImages, 
            @RequestAttribute("authenticatedEmail") String email) {

        try {
            Optional<User> userOptional = userRepository.findByEmail(email);
            if (userOptional.isEmpty()) return ResponseEntity.status(401).body("Error: Unauthorized.");
            
            Optional<Product> productOpt = productRepository.findById(id);
            if (productOpt.isEmpty()) return ResponseEntity.status(404).body("Error: Product not found.");

            Product product = productOpt.get();
            User requester = userOptional.get();
            String role = requester.getRole().toUpperCase();

            boolean isOwner = product.getSellerEmail().equalsIgnoreCase(email);
            boolean isStaff = role.contains("ADMIN") || role.contains("DEVELOPER");

            if (isOwner || isStaff) {
                product.setName(updatedProduct.getName());
                product.setDescription(updatedProduct.getDescription());
                product.setCategory(updatedProduct.getCategory());
                product.setPrice(updatedProduct.getPrice());
                product.setStock(updatedProduct.getStock());

                List<String> finalImageUrls = new ArrayList<>();
                if (existingImages != null) finalImageUrls.addAll(existingImages);
                
                if (files != null && files.length > 0) {
                    for (MultipartFile file : files) {
                        if (file != null && !file.isEmpty()) {
                            String url = fileUploadService.uploadFile(file);
                            if (url != null) finalImageUrls.add(url);
                        }
                    }
                }

                if (finalImageUrls.size() > 5) return ResponseEntity.badRequest().body("Error: Total images cannot exceed 5.");
                product.setImageUrls(finalImageUrls.isEmpty() ? "" : String.join(",", finalImageUrls));
                productRepository.save(product);

                if (isStaff && !isOwner) {
                    String subject = "Product Updated by WebMart Support";
                    String body = "Hello,\n\nYour product '" + product.getName() + "' (ID: " + id + ") has been updated by the Admin team.\n\nPlease check your dashboard for details.";
                    emailService.sendEmail(product.getSellerEmail(), subject, body);
                }

                return ResponseEntity.ok("Success: Product updated!");
            }
            return ResponseEntity.status(403).body("Error: Permission denied.");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error during update: " + e.getMessage());
        }
    }


    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id, @RequestAttribute("authenticatedEmail") String email) {
        Optional<User> userOptional = userRepository.findByEmail(email);
        if (userOptional.isEmpty()) return ResponseEntity.status(404).body("Error: User not found!");
        
        Optional<Product> productOptional = productRepository.findById(id);
        if (productOptional.isPresent()) {
            Product product = productOptional.get();
            String sellerEmail = product.getSellerEmail();
            String productName = product.getName();
            
            boolean isOwner = sellerEmail.equalsIgnoreCase(email);
            boolean isStaff = userOptional.get().getRole().toUpperCase().contains("ADMIN") || userOptional.get().getRole().toUpperCase().contains("DEVELOPER");

            if (isOwner || isStaff) {
                productRepository.deleteById(id);

                if (isStaff && !isOwner) {
                    String subject = "Product Removed from WebMart";
                    String body = "Hello,\n\nWe would like to inform you that your product '" + productName + "' has been removed by the Admin team.\n\nReason: Policy violation or Catalog Cleanup.";
                    emailService.sendEmail(sellerEmail, subject, body);
                }

                return ResponseEntity.ok("Success: Product deleted!");
            }
        }
        return ResponseEntity.status(404).body("Error: Product not found!");
    }



    @GetMapping("/details/{id}")
    public ResponseEntity<?> getProductDetails(@PathVariable Long id) {
        Optional<Product> productOpt = productRepository.findById(id);
        if (productOpt.isEmpty()) return ResponseEntity.status(404).body("Error: Product not found.");
        
        Product product = productOpt.get();
        

        if (product.getSeller() == null) {
            return ResponseEntity.status(410).body("Error: This product is no longer available as the seller account was removed.");
        }

        List<Review> reviews = reviewRepository.findByProductId(id);
        double averageRating = reviews.stream().mapToInt(Review::getRating).average().orElse(0.0);
        
        Map<String, Object> response = new HashMap<>();
        response.put("product", product);
        response.put("averageRating", String.format("%.1f", averageRating)); 
        response.put("reviewCount", reviews.size());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchProducts(@RequestParam String name) {

        return ResponseEntity.ok(productRepository.findActiveByName(name));
    }

    @GetMapping("/filter/category")
    public ResponseEntity<?> filterByCategory(@RequestParam String category) {

        return ResponseEntity.ok(productRepository.findActiveByCategory(category));
    }

    @GetMapping("/all")
    public ResponseEntity<List<Product>> getAllProducts() {

        return ResponseEntity.ok(productRepository.findAllActiveProducts());
    }
}