package com.kartik.WebMart.config;

import java.util.Arrays;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
public class SecurityConfig {

    @Autowired
    private JwtFilter jwtFilter;

    @Value("${FRONTEND_URL}")
    private String frontendUrl;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // LOCALHOST AUR VERCEL DONO ALLOWED HAIN
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:3000", frontendUrl));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "Accept", "X-Requested-With"));
        configuration.setExposedHeaders(List.of("Authorization"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L); 
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource())) 
            .csrf(csrf -> csrf.disable()) 
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers("/api/auth/**").permitAll() 
                .requestMatchers(HttpMethod.GET, "/api/products/all", "/api/products/details/**", "/api/products/search","/api/products/filter/category**", "/api/reviews/product/**").permitAll()
                .requestMatchers(HttpMethod.DELETE, "/api/admin/**").hasAnyAuthority("ADMIN", "DEVELOPER")
                .requestMatchers(HttpMethod.DELETE, "/api/products/delete/**").hasAnyAuthority("SELLER", "ADMIN", "DEVELOPER")
                .requestMatchers(HttpMethod.DELETE, "/api/reviews/delete/**").hasAnyAuthority("BUYER", "SELLER", "ADMIN", "DEVELOPER")
                .requestMatchers("/api/products/add", "/api/products/update/**").hasAnyAuthority("SELLER", "ADMIN", "DEVELOPER")
                .requestMatchers("/api/seller/**").hasAnyAuthority("SELLER", "ADMIN", "DEVELOPER")
                .requestMatchers("/api/admin/**").hasAnyAuthority("ADMIN", "DEVELOPER")
                .requestMatchers("/api/reviews/add").hasAnyAuthority("BUYER", "SELLER", "ADMIN", "DEVELOPER")
                .requestMatchers("/api/cart/**", "/api/buyer/**").hasAnyAuthority("BUYER")
                .requestMatchers("/api/orders/all","/api/orders/update-status/**").hasAnyAuthority("ADMIN","DEVELOPER")
                .requestMatchers("/api/orders/cancel/**").hasAnyAuthority("BUYER", "SELLER", "ADMIN", "DEVELOPER")
                .requestMatchers("/api/orders/place", "/api/orders/history").hasAnyAuthority("BUYER")
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}