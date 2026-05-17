package com.kartik.WebMart.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "users")
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;
    
    @Column(unique = true, nullable = false)
    private String username;

    @Column(nullable = false)
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String password;
    private boolean isVerified = false; // By default false rahega
    private String otp; // Temporary OTP store karne ke liye

    private String role;
    
    private String companyName; // Existing logic for "WebMart" admins
    private LocalDateTime otpExpiryTime;


    private String fullName;
    private String phoneNumber;
    private String accountStatus = "ACTIVE";
    @Column(length = 500)
    private String address;
    private String profileImageUrl;


    @OneToMany(mappedBy = "user")
    @JsonIgnoreProperties("user")
    private List<Order> orders;


    public User() {}


    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    
    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }


    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getProfileImageUrl() { return profileImageUrl; }
    public void setProfileImageUrl(String profileImageUrl) { this.profileImageUrl = profileImageUrl; }
    
    public String getOtp() { return otp; }
    public void setOtp(String otp) {  this.otp = otp; }

    public boolean isVerified() {return isVerified;}
    public void setVerified(boolean isVerified) {this.isVerified = isVerified;}
    
    public LocalDateTime getOtpExpiryTime() { return otpExpiryTime; }
    public void setOtpExpiryTime(LocalDateTime otpExpiryTime) { this.otpExpiryTime = otpExpiryTime; }
    
    public String getAccountStatus() {
        return accountStatus;
    }

    public void setAccountStatus(String accountStatus) {
        this.accountStatus = accountStatus;
    }


    public List<Order> getOrders() { return orders; }
    public void setOrders(List<Order> orders) { this.orders = orders; }
}