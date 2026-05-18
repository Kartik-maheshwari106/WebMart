package com.kartik.WebMart.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.http.MediaType;
import java.util.Map;
import java.util.List;

@Service
public class EmailService {
    
    @Value("${brevo.api.key}")
    private String brevoApiKey;

    @Value("${brevo.sender.email}")
    private String senderEmail;

    public void sendEmail(String to, String subject, String body) {
        if (brevoApiKey == null || brevoApiKey.equals("missing") || brevoApiKey.isEmpty()) {
            System.out.println("🔴 ERROR: BREVO API KEY RENDER SE NAHI MILI!");
            throw new RuntimeException("API Key Missing");
        }

        String url = "https://api.brevo.com/v3/smtp/email";
        RestTemplate restTemplate = new RestTemplate();

        HttpHeaders headers = new HttpHeaders();
        headers.set("api-key", brevoApiKey);
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> bodyMap = Map.of(
            "sender", Map.of("name", "WebMart", "email", senderEmail),
            "to", List.of(Map.of("email", to)),
            "subject", subject,
            "htmlContent", "<p>" + body.replace("\n", "<br>") + "</p>" 
        );

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(bodyMap, headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, entity, String.class);
            System.out.println("🟢 Brevo API Success: Email Sent to " + to);
        } catch (org.springframework.web.client.HttpStatusCodeException e) {
            System.out.println("🔴 BREVO REJECTED! Exact Error: " + e.getResponseBodyAsString());
            e.printStackTrace();
            throw new RuntimeException("Failed to send email via Brevo API");
        } catch (Exception e) {
            System.out.println("🔴 BREVO NETWORK ERROR: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to send email via Brevo API");
        }
    }
    
    public void sendOtpEmail(String to, String otp) {
        String subject = "WebMart - Account Verification OTP";
        String body = "Welcome to WebMart!\n\n" +
                      "Your verification code is: " + otp + "\n\n" +
                      "Please enter this code on the registration page to verify your account.\n" +
                      "OTP valid till 5 Minitues \n"+
                      "For security reasons, do not share this code with anyone.";
        
        sendEmail(to, subject, body);
    }
    
    public void sendResetOtp(String to, String otp) {
        String subject = " WebMart - Reset Password Verification OTP ";
        String body = "Welcome to WebMart!\n\n" +
                "Your verification code is: " + otp + "\n\n" +
                "Please enter this code to registration page to reset password \n"+
                "OTP valid till 5 Minitues \n"+
                "For security reasons, do not share this code with anyone.";
        sendEmail(to, subject, body);
    }
}