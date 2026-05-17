package com.kartik.WebMart.controller;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.Random;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.kartik.WebMart.model.User;
import com.kartik.WebMart.repository.UserRepository;
import com.kartik.WebMart.security.JwtUtil;
import com.kartik.WebMart.service.AuthService;
import com.kartik.WebMart.service.EmailService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;
    
    @Autowired
    private AuthService authService;
    
    @Autowired
    private EmailService emailService;
    
    @Value("${BOSS_EMAIL}")
    private String BOSS_EMAIL;


    @PostMapping("/register") 
    public Object registerUser(@RequestBody User user) {
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            return ResponseEntity.status(400).body("Error: Email already registered!");
        }
        
        if (user.getUsername() != null && userRepository.findByUsername(user.getUsername()).isPresent()) {
            return ResponseEntity.status(400).body("Error: Username taken!");
        }

        String requestedRole = (user.getRole() == null || user.getRole().isEmpty()) 
                ? "BUYER" : user.getRole().toUpperCase();
        user.setRole(requestedRole);

        if (requestedRole.equals("ADMIN") || requestedRole.equals("DEVELOPER")) {
            return ResponseEntity.status(403).body("Error: Restricted Role!");
        }
 
        if (requestedRole.equals("BUYER")) {
            if (user.getCompanyName() != null && !user.getCompanyName().trim().isEmpty()) {
                return ResponseEntity.status(400).body("Error: Buyers cannot have a Company Name.");
            }
        } else if (requestedRole.equals("SELLER")) {
            if (user.getCompanyName() == null || user.getCompanyName().trim().isEmpty()) {
                return ResponseEntity.status(400).body("Error: Sellers MUST provide a Company Name!");
            }
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));

        if (user.getAccountStatus() == null) user.setAccountStatus("ACTIVE");
        
        return authService.registerUser(user);
    }


    @PostMapping("/verify-otp")
    public Object verifyOtp(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String otp = request.get("otp");
        String purpose = request.get("purpose"); 
        if (purpose == null) purpose = "registration"; 
        return authService.verifyOtp(email, otp, purpose);
    }


    @PostMapping("/resend-otp")
    public ResponseEntity<?> resendOtp(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        Optional<User> userOpt = userRepository.findByEmail(email);
        
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            String newOtp = String.format("%06d", new Random().nextInt(1000000));
            user.setOtp(newOtp);
            user.setOtpExpiryTime(LocalDateTime.now().plusMinutes(2));
            userRepository.save(user);
            
            try {
                emailService.sendOtpEmail(email, newOtp);
                return ResponseEntity.ok("Success: A new OTP has been sent to your email!");
            } catch (Exception e) {
                return ResponseEntity.status(500).body("Error: Failed to send email.");
            }
        }
        return ResponseEntity.status(404).body("Error: User not found!");
    }


    @PostMapping("/login")
    public Object loginUser(@RequestBody User loginRequest) {
        Optional<User> userOpt = userRepository.findByEmail(loginRequest.getEmail());

        if (userOpt.isPresent()) {
            User user = userOpt.get();
            

            if (!user.isVerified()) {
                String newOtp = String.format("%06d", new Random().nextInt(1000000));
                user.setOtp(newOtp);
                user.setOtpExpiryTime(LocalDateTime.now().plusMinutes(2));
                userRepository.save(user);
                emailService.sendOtpEmail(user.getEmail(), newOtp);
                return ResponseEntity.status(403).body("Error: Account not verified! We've sent a new OTP to your email.");
            }


            if ("BLOCKED".equalsIgnoreCase(user.getAccountStatus())) {
                return ResponseEntity.status(403).body("Error: Access Denied! Your account has been suspended by the administrator.");
            }


            if (passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
                String token = jwtUtil.generateToken(user.getEmail(), user.getRole());
                Map<String, Object> response = new HashMap<>();
                response.put("token", token);
                response.put("email", user.getEmail());
                response.put("role", user.getRole());
                response.put("fullName", user.getFullName());
                response.put("username", user.getUsername());
                response.put("companyName", user.getCompanyName());
                response.put("profilePic", user.getProfileImageUrl());
                response.put("accountStatus", user.getAccountStatus()); // Status bhi bhej dete hain
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.status(401).body("Error: Invalid Password!");
            }
        }
        return ResponseEntity.status(404).body("Error: User not found!");
    }


    @PostMapping("/forget-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) return ResponseEntity.status(404).body("Error: User not found!");

        User user = userOpt.get();
        String resetOtp = String.format("%06d", new Random().nextInt(900000) + 100000);
        user.setOtp(resetOtp);
        user.setOtpExpiryTime(LocalDateTime.now().plusMinutes(2));
        userRepository.save(user);
        
        emailService.sendResetOtp(email, resetOtp);
        return ResponseEntity.ok("Success: OTP sent to your email!");
    }


    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String otp = request.get("otp");
        String newPassword = request.get("newPassword");

        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) return ResponseEntity.status(404).body("Error: User not found!");

        User user = userOpt.get();
        if (user.getOtp() == null || !user.getOtp().equals(otp)) {
            return ResponseEntity.status(400).body("Error: Invalid OTP!");
        }
        if (user.getOtpExpiryTime() != null && LocalDateTime.now().isAfter(user.getOtpExpiryTime())) {
            return ResponseEntity.status(410).body("Error: OTP Expired!");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setOtp(null);
        user.setOtpExpiryTime(null);
        userRepository.save(user);

        return ResponseEntity.ok("Success: Password has been reset.");
    }
}