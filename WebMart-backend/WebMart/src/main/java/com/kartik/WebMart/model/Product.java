package com.kartik.WebMart.model;

import jakarta.persistence.*;
import java.util.*;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "products")
@JsonInclude(JsonInclude.Include.NON_NULL)
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String description;
    private double price;
    private int stock;
    private String category;


    @Column(columnDefinition = "TEXT")
    private String imageUrls;


    @Transient
    private List<String> images;

    private String sellerEmail;
    private String sellerName;

    @OneToMany(mappedBy = "product")
    private List<OrderItem> orderItems;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "seller_id", referencedColumnName = "id")
    @JsonIgnoreProperties({"products", "orders", "password", "role", "city", "companyName"})
    private User seller;

    public Product() {}


    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public double getPrice() { return price; }
    public void setPrice(double price) { this.price = price; }
    public int getStock() { return stock; }
    public void setStock(int stock) { this.stock = stock; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getSellerEmail() { return sellerEmail; }
    public void setSellerEmail(String sellerEmail) { this.sellerEmail = sellerEmail; }
    public String getSellerName() { return sellerName; }
    public void setSellerName(String sellerName) { this.sellerName = sellerName; }
    public User getSeller() { return seller; }
    public void setSeller(User seller) { this.seller = seller; }


    public String getImageUrls() { return imageUrls; }
    public void setImageUrls(String imageUrls) { this.imageUrls = imageUrls; }

    public List<String> getImages() { return images; }
    public void setImages(List<String> images) { this.images = images; }
}