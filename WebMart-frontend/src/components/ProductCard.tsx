import React from 'react';
import { Star, ShoppingCart, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext'; // 🚩 Role check ke liye import kiya

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image: string;
  rating?: number;
  category?: string;
}

const ProductCard = ({ id, name, price, image, rating = 0, category }: ProductCardProps) => {
  const { addToCart } = useCart();
  const { user } = useAuth(); // 🚩 Current user ka data nikala


  const isBusinessRole = 
    user?.role === 'SELLER' || 
    user?.role === 'ADMIN' || 
    user?.role === 'DEVELOPER';

  return (
    <div className="group animate-fade-in rounded-xl border bg-card overflow-hidden shadow-card hover:shadow-elevated transition-all duration-300">
      <Link to={`/product/${id}`} className="block overflow-hidden">
        <img
          src={image || '/placeholder.svg'}
          alt={name}
          className="h-56 w-full object-cover bg-muted transition-transform duration-300 group-hover:scale-105"
        />
      </Link>
      <div className="p-4 space-y-2">
        {category && (
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{category}</span>
        )}
        <Link to={`/product/${id}`}>
          <h3 className="font-heading text-sm font-semibold leading-tight hover:text-primary transition-colors line-clamp-2">{name}</h3>
        </Link>
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }, (_, i) => (
            <Star key={i} className={`h-3.5 w-3.5 ${i < Math.round(rating) ? 'fill-accent text-accent' : 'text-border'}`} />
          ))}
          <span className="text-xs text-muted-foreground ml-1">({rating.toFixed(1)})</span>
        </div>
        
        <div className="flex items-center justify-between pt-1">
          <span className="font-heading text-lg font-bold">₹{price.toLocaleString()}</span>
          
          {/* 🚩 CONDITION: Agar Business Role hai toh restricted message dikhao, warna Add to Cart button */}
          {isBusinessRole ? (
            <div className="flex items-center gap-1.5 rounded-lg bg-muted px-2 py-1.5 text-[10px] font-bold text-muted-foreground border border-dashed border-border">
              <Lock className="h-3 w-3" />
              <span>{user?.role} MODE</span>
            </div>
          ) : (
            <button
              onClick={() => addToCart({ id, name, price, image })}
              className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90 transition-all active:scale-95"
            >
              <ShoppingCart className="h-3.5 w-3.5" />
              Add to Cart
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;