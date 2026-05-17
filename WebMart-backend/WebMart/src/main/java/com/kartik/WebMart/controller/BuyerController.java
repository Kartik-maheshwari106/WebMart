package com.kartik.WebMart.controller;

import com.kartik.WebMart.model.User;
import com.kartik.WebMart.model.ProfileUpdateRequest;
import com.kartik.WebMart.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Optional;

@RestController
@RequestMapping("/api/buyer")
public class BuyerController {
    
    @Autowired
    private UserRepository userRepository;
    
    @PutMapping("/profile/update")
    public ResponseEntity<?> updateProfile(
        @RequestAttribute("authenticatedEmail") String email, 
        @RequestBody ProfileUpdateRequest request
    ) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body("Error: User not found!");
        }

        User user = userOpt.get();


        if ((user.getUsername() == null || user.getUsername().isEmpty()) && request.getUsername() != null) {
            user.setUsername(request.getUsername());
        }


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