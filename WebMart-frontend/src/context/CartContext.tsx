import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';

interface CartItem {
  id: number;
  productId: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  addToCart: (product: any) => Promise<void>;
  removeFromCart: (cartId: number) => Promise<void>;
  updateQuantity: (productId: number, quantity: number) => Promise<void>;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  fetchCartFromDB: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, user } = useAuth();


  const isBusinessAccount = user?.role === 'SELLER' || user?.role === 'ADMIN' || user?.role === 'DEVELOPER';

  const fetchCartFromDB = async () => {
    const token = localStorage.getItem('webmart_token');
    

    if (!token || !isAuthenticated || isBusinessAccount) {
      setItems([]);
      return;
    }

    try {
      const response = await api.get('/cart/view');
      const dbItems = response.data.map((item: any) => ({
        id: item.id,
        productId: item.product.id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        image: item.product.imageURL || (item.product.images && item.product.images[0]) || ""
      }));
      setItems(dbItems);
    } catch (error) {
      console.error("Cart Fetch Error:", error);
    }
  };

  useEffect(() => {
    fetchCartFromDB();
  }, [isAuthenticated, user?.role]);

  const addToCart = async (product: any) => {
    if (!isAuthenticated) {
      toast.error("Please login first!");
      return;
    }

    if (isBusinessAccount) {
      toast.error(`Access Denied: ${user?.role} accounts cannot shop.`);
      return;
    }

    try {
      const response = await api.post('/cart/add', { productId: product.id, quantity: 1 });
      if (response.status === 200 || response.status === 201) {
        await fetchCartFromDB(); 
        toast.success(`${product.name} added to cart!`);
        setIsOpen(true);
      }
    } catch (error: any) {
      toast.error(error.response?.data || "Failed to add to cart");
    }
  };

  const removeFromCart = async (cartId: number) => {
    try {
      await api.delete(`/cart/remove/${cartId}`);
      setItems((prev) => prev.filter((i) => i.id !== cartId));
    } catch (error) {
      fetchCartFromDB();
    }
  };

  const updateQuantity = async (productId: number, quantity: number) => {
    if (quantity <= 0) return;
    try {
      await api.put('/cart/update-quantity', { productId, newQuantity: quantity });
      setItems(prev => prev.map(i => i.productId === productId ? { ...i, quantity } : i));
    } catch (error) {
      fetchCartFromDB();
    }
  };

  const clearCart = () => setItems([]);

  const totalItems = isBusinessAccount ? 0 : items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = isBusinessAccount ? 0 : items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ 
      items, isOpen, setIsOpen, addToCart, removeFromCart, 
      updateQuantity, clearCart, totalItems, subtotal, fetchCartFromDB 
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};