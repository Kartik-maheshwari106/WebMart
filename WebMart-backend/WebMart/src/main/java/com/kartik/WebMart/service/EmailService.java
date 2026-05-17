package com.kartik.WebMart.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;
    @Value("${spring.mail.username}")
    private String senderEmail;


    public void sendEmail(String to, String subject, String body) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(senderEmail); 
        message.setTo(to);
        message.setSubject(subject);
        message.setText(body);
        
        mailSender.send(message);
    }
    public void sendOtpEmail(String to, String otp) {
        String subject = "WebMart - Account Verification OTP";
        String body = "Welcome to WebMart!\n\n" +
                      "Your verification code is: " + otp + "\n\n" +
                      "Please enter this code on the registration page to verify your account.\n" +
                      "OTP valid till 2 Minitues \n"+
                      "For security reasons, do not share this code with anyone.";
        

        sendEmail(to, subject, body);
    }
    
    public void sendResetOtp(String to, String otp) {
    	String subject = " WebMart - Reset Password Verification OTP ";
    	String body = "Welcome to WebMart!\n\n" +
                "Your verification code is: " + otp + "\n\n" +
                "Please enter this code to registration page to reset password \n"+
                "OTP valid till 2 Minitues \n"+
                "For security reasons, do not share this code with anyone.";
    	sendEmail(to,subject,body);
    }
}
