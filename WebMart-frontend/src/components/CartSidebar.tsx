import React from 'react';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useNavigate } from 'react-router-dom';

const CartSidebar = () => {

  const { items, isOpen, setIsOpen, updateQuantity, removeFromCart, subtotal } = useCart();
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <>
      {/* 🌫️ Backdrop: Subtle blur for focus */}
      <div 
        className="fixed inset-0 z-[100] bg-sidebar/30 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={() => setIsOpen(false)} 
      />

      {/* 🛒 Sidebar Panel */}
      <div className="fixed right-0 top-0 z-[101] flex h-full w-full max-w-md animate-slide-in-right flex-col bg-background shadow-2xl border-l border-border/40">
        
        {/* Header: Sticky & Blurry */}
        <div className="flex items-center justify-between border-b border-border/50 bg-card/80 backdrop-blur-md p-6">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2.5 rounded-2xl">
              <ShoppingBag className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-black italic tracking-tight">Your Cart</h2>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                {items.length} Premium Items
              </p>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)} 
            className="rounded-full p-2 hover:bg-muted transition-all active:scale-90"
          >
            <X className="h-6 w-6 text-muted-foreground" />
          </button>
        </div>

        {/* Content: Items List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center opacity-40 animate-in zoom-in-95">
              <div className="bg-muted p-8 rounded-[3rem] mb-4">
                 <ShoppingBag className="h-16 w-16 stroke-[1px]" />
              </div>
              <p className="text-sm font-black uppercase tracking-[0.2em]">Cart is empty</p>
              <button 
                onClick={() => setIsOpen(false)}
                className="mt-4 text-xs font-bold text-primary underline underline-offset-4"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              {items.map((item) => (
                <div 
                  key={item.productId} 
                  className="group relative flex gap-4 rounded-[2rem] bg-card p-4 border border-border/40 shadow-sm transition-all hover:shadow-md hover:border-primary/20"
                >
                  {/* Item Image */}
                  <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-2xl bg-muted/30 border border-border/10">
                    <img 
                        src={item.image || '/placeholder.svg'} 
                        alt={item.name} 
                        className="h-full w-full object-contain p-2 transition-transform duration-500 group-hover:scale-110" 
                    />
                  </div>
                  
                  {/* Item Details */}
                  <div className="flex flex-1 flex-col justify-between py-1">
                    <div>
                      <h4 className="line-clamp-1 text-sm font-black text-foreground/80 font-body">{item.name}</h4>
                      <p className="mt-1 text-lg font-black text-primary italic font-heading tracking-tighter">
                        ₹{item.price.toLocaleString()}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      {/* Modern Quantity Selector */}
                      <div className="flex items-center gap-1 rounded-xl bg-muted/50 p-1 border border-border/50">
                        <button 
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)} 
                          className="p-1.5 hover:text-primary transition-colors disabled:opacity-20"
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="min-w-[28px] text-center text-xs font-black">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)} 
                          className="p-1.5 hover:text-primary transition-colors"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      <button 
                        onClick={() => removeFromCart(item.id)} 
                        className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer: Summary & Checkout */}
        {items.length > 0 && (
          <div className="border-t border-border/50 bg-card/80 backdrop-blur-md p-8 space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                <span>Estimated Subtotal</span>
                <span className="text-foreground">₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-xl font-black italic tracking-tight">Order Total</span>
                <span className="text-3xl font-black text-primary italic font-heading tracking-tighter">
                    ₹{subtotal.toLocaleString()}
                </span>
              </div>
            </div>

            <button
              onClick={() => { setIsOpen(false); navigate('/checkout'); }}
              className="group relative flex w-full items-center justify-center gap-3 rounded-[1.5rem] bg-foreground py-5 font-black text-background transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-foreground/20"
            >
              Secure Checkout
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </button>
            
            <p className="text-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">
              ⚡ Delivery in 24-48 Hours
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default CartSidebar;