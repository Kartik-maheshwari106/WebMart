package com.kartik.WebMart.service;

import com.resend.Resend;
import com.resend.core.exception.ResendException;
import com.resend.services.emails.model.CreateEmailOptions;
import com.resend.services.emails.model.CreateEmailResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

// ==========================================
// PURANE IMPORTS (Backup ke liye rakhe hain)
// ==========================================
// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.mail.SimpleMailMessage;
// import org.springframework.mail.javamail.JavaMailSender;

@Service
public class EmailService {

    // ==========================================
    // YAHAN TERA PURANA GMAIL WALA CODE HAI (COMMENTED)
    // ==========================================
    /*
    @Autowired
    private JavaMailSender mailSender;
    
    @Value("${spring.mail.username}")
    private String senderEmail;

    public void sendEmailOld(String to, String subject, String body) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(senderEmail); 
        message.setTo(to);
        message.setSubject(subject);
        message.setText(body);
        
        mailSender.send(message);
    }
    */

    // ==========================================
    // NAYA RESEND API WALA CODE 🔥
    // ==========================================
    
    @Value("${RESEND_API_KEY}")
    private String resendApiKey;

    public void sendEmail(String to, String subject, String body) {
        // Resend client initialize
        Resend resend = new Resend(resendApiKey);

        // Naya Email Message Banaya
        CreateEmailOptions params = CreateEmailOptions.builder()
                .from("WebMart <onboarding@resend.dev>") // Free tier mein onboarding@resend.dev hi use hota hai
                .to(to)
                .subject(subject)
                .text(body) // Tera purana message format as it is chala jayega (\n ke sath)
                .build();

        try {
            CreateEmailResponse response = resend.emails().send(params);
            System.out.println("🟢 Resend API Success: Email Sent! ID: " + response.getId());
        } catch (ResendException e) {
            System.out.println("🔴 Resend API Failed!");
            e.printStackTrace();
            throw new RuntimeException("Failed to send email via Resend API");
        }
    }

    // ==========================================
    // TERE ORIGINAL OTP FUNCTIONS (NO CHANGES HERE)
    // ==========================================
    
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
    	sendEmail(to, subject, body);
    }
}