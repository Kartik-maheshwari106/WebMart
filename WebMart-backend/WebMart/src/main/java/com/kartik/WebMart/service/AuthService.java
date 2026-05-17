package com.kartik.WebMart.service;

import com.kartik.WebMart.model.User;
import com.kartik.WebMart.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import java.util.Optional;
import java.util.Random;
import java.time.*;
import java.util.UUID;
import java.util.Map;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private EmailService emailService;

    public ResponseEntity<?> registerUser(User user) {
        if (user.getUsername() == null || user.getUsername().trim().isEmpty()) {
            String emailPrefix = user.getEmail().split("@")[0];
            String randomID = UUID.randomUUID().toString().substring(0, 6);
            user.setUsername(emailPrefix + "_" + randomID);
        }
        
        String generatedOtp = String.format("%06d", new Random().nextInt(1000000));
        user.setOtp(generatedOtp);
        user.setVerified(false); 
        user.setOtpExpiryTime(LocalDateTime.now().plusMinutes(5)); // Time badha diya safety ke liye

        userRepository.save(user);

        try {
    emailService.sendOtpEmail(user.getEmail(), generatedOtp);
    return ResponseEntity.ok(Map.of("message", "OTP sent to your email. Valid for 5 minutes."));
} catch (Exception e) {
    System.out.println("Error! failed to send email: " + e.getMessage());
    e.printStackTrace(); 
    userRepository.delete(user);
    return ResponseEntity.status(500).body(Map.of("message", "Error: Failed to send email. Please check server logs."));
}
    }

    public ResponseEntity<?> verifyOtp(String email, String otp, String purpose) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("message", "Error: User not found!"));
        }

        User user = userOpt.get();
        
        if (user.getOtpExpiryTime() != null && LocalDateTime.now().isAfter(user.getOtpExpiryTime())) {
            return ResponseEntity.status(410).body(Map.of("message", "Error: OTP Expired! Please resend."));
        }
         
        if (user.getOtp() != null && user.getOtp().equals(otp)) {
            if ("registration".equalsIgnoreCase(purpose)) {
                user.setVerified(true);

                user.setOtp(null);  
                user.setOtpExpiryTime(null);
                userRepository.save(user);
                
                return ResponseEntity.ok(Map.of("message", "OTP Verification Successful! Registered as " + user.getRole()));
            }
            return ResponseEntity.ok(Map.of("message", "OTP Verified! Proceed to reset password."));
        } else {
            return ResponseEntity.status(400).body(Map.of("message", "Error: Invalid OTP!"));
        }
    }
}