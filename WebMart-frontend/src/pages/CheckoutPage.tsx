import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, CreditCard, Truck, Loader2, CheckCircle2, ShoppingBag, ArrowLeft, ShieldCheck } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import PaymentModal from '@/components/PaymentModal';

const CheckoutPage = () => {
  const { items, subtotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [address, setAddress] = useState({ 
    street: '', 
    city: '', 
    state: '', 
    pincode: '', 
    phone: '' 
  });
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [loading, setLoading] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const handlePlaceOrderClick = (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.phone || address.phone.length < 10) {
      return toast.error("Please enter a valid phone number");
    }
    if (paymentMethod === 'Razorpay') {
      setIsPaymentModalOpen(true);
    } else {
      processOrder('COD');
    }
  };

  const processOrder = async (finalMethod: string, paymentId: string = '') => {
    setLoading(true);
    const payload = {
      address: `${address.street}, ${address.city}, ${address.state} - ${address.pincode} (Phone: ${address.phone})`,
      paymentMethod: finalMethod,
      transactionId: paymentId,
    };

    try {
      await api.post('/orders/place', payload);
      toast.success(finalMethod === 'COD' ? 'Order placed via COD!' : 'Payment Successful & Order Placed!');
      clearCart();
      navigate('/orders');
    } catch (error: any) {
      const serverError = error.response?.data;
      toast.error(typeof serverError === 'string' ? serverError : "Failed to place order.");
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = (paymentDetails: any) => {
    processOrder('ONLINE_PAID', paymentDetails.razorpay_payment_id);
  };

  if (items.length === 0) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 animate-in fade-in zoom-in-95 duration-500">
        <div className="h-24 w-24 rounded-[2.5rem] bg-muted flex items-center justify-center shadow-inner">
          <ShoppingBag className="h-10 w-10 text-muted-foreground/50" />
        </div>
        <div className="text-center space-y-2">
            <h2 className="text-2xl font-black italic">Your cart is empty</h2>
            <p className="text-muted-foreground font-medium">Add some premium items to get started.</p>
        </div>
        <button 
            onClick={() => navigate('/')} 
            className="flex items-center gap-2 rounded-full bg-primary px-8 py-3 font-black text-white hover:brightness-110 transition-all shadow-lg shadow-primary/20"
        >
          <ArrowLeft className="h-4 w-4" /> Go Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-6xl animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
            <h1 className="text-5xl font-black tracking-tighter italic">Checkout.</h1>
            <p className="text-muted-foreground mt-2 font-bold uppercase tracking-widest text-[10px]">Secure Gateway • Fast Delivery • 24/7 Support</p>
        </div>
        <button onClick={() => navigate(-1)} className="text-xs font-black uppercase tracking-widest flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Cart
        </button>
      </div>

      <form onSubmit={handlePlaceOrderClick} className="grid gap-12 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-10">
          
          {/* Shipping Section */}
          <div className="rounded-[3rem] border border-border/50 bg-card p-10 shadow-sm space-y-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                <MapPin className="h-32 w-32" />
            </div>
            
            <h2 className="flex items-center gap-4 text-2xl font-black italic">
              <span className="p-3 bg-primary text-white rounded-2xl shadow-lg shadow-primary/20">
                <MapPin className="h-6 w-6" />
              </span>
              Shipping Details
            </h2>
            
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="sm:col-span-2 space-y-2">
                <label className="text-[10px] font-black uppercase text-muted-foreground ml-2 tracking-[0.2em]">Street Address</label>
                <input 
                  value={address.street} 
                  onChange={(e) => setAddress({ ...address, street: e.target.value })} 
                  className="w-full rounded-[1.5rem] border bg-slate-50/50 px-6 py-4 text-sm font-bold outline-none focus:ring-4 ring-primary/10 transition-all border-slate-200 focus:border-primary focus:bg-white" 
                  placeholder="Flat No, Wing, Street Name"
                  required 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-muted-foreground ml-2 tracking-[0.2em]">City</label>
                <input 
                  value={address.city} 
                  onChange={(e) => setAddress({ ...address, city: e.target.value })} 
                  className="w-full rounded-[1.5rem] border bg-slate-50/50 px-6 py-4 text-sm font-bold outline-none focus:ring-4 ring-primary/10 transition-all border-slate-200 focus:border-primary focus:bg-white" 
                  placeholder="Mumbai"
                  required 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-muted-foreground ml-2 tracking-[0.2em]">State</label>
                <input 
                  value={address.state} 
                  onChange={(e) => setAddress({ ...address, state: e.target.value })} 
                  className="w-full rounded-[1.5rem] border bg-slate-50/50 px-6 py-4 text-sm font-bold outline-none focus:ring-4 ring-primary/10 transition-all border-slate-200 focus:border-primary focus:bg-white" 
                  placeholder="Maharashtra"
                  required 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-muted-foreground ml-2 tracking-[0.2em]">PIN Code</label>
                <input 
                  value={address.pincode} 
                  onChange={(e) => setAddress({ ...address, pincode: e.target.value })} 
                  className="w-full rounded-[1.5rem] border bg-slate-50/50 px-6 py-4 text-sm font-bold outline-none focus:ring-4 ring-primary/10 transition-all border-slate-200 focus:border-primary focus:bg-white" 
                  placeholder="400001"
                  required 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-muted-foreground ml-2 tracking-[0.2em]">Contact Phone</label>
                <input 
                  type="tel"
                  value={address.phone} 
                  onChange={(e) => setAddress({ ...address, phone: e.target.value })} 
                  className="w-full rounded-[1.5rem] border bg-slate-50/50 px-6 py-4 text-sm font-bold outline-none focus:ring-4 ring-primary/10 transition-all border-slate-200 focus:border-primary focus:bg-white" 
                  placeholder="+91 XXXXX XXXXX"
                  required 
                />
              </div>
            </div>
          </div>

          {/* Payment Method Section */}
          <div className="rounded-[3rem] border border-border/50 bg-card p-10 shadow-sm space-y-8">
            <h2 className="flex items-center gap-4 text-2xl font-black italic">
              <span className="p-3 bg-primary text-white rounded-2xl shadow-lg shadow-primary/20">
                <CreditCard className="h-6 w-6" />
              </span>
              Payment Method
            </h2>
            
            <div className="grid gap-6 sm:grid-cols-2">
              {[
                { value: 'Razorpay', label: 'Online Payment', desc: 'UPI, Cards, NetBanking', icon: <CreditCard className="h-5 w-5" /> }, 
                { value: 'COD', label: 'Cash on Delivery', desc: 'Pay at your doorstep', icon: <Truck className="h-5 w-5" /> }
              ].map((pm) => (
                <label 
                  key={pm.value} 
                  className={`relative flex cursor-pointer flex-col gap-2 rounded-[2rem] border-2 p-8 transition-all ${
                    paymentMethod === pm.value 
                      ? 'border-primary bg-primary/5 shadow-xl shadow-primary/5' 
                      : 'hover:bg-slate-50 border-slate-100 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className={`p-3 rounded-2xl ${paymentMethod === pm.value ? 'bg-primary text-white' : 'bg-slate-100 text-slate-400'}`}>
                      {pm.icon}
                    </div>
                    <input 
                      type="radio" 
                      name="payment" 
                      value={pm.value} 
                      checked={paymentMethod === pm.value} 
                      onChange={(e) => setPaymentMethod(e.target.value)} 
                      className="h-6 w-6 accent-primary cursor-pointer" 
                    />
                  </div>
                  <div className="mt-4">
                    <span className="text-lg font-black italic tracking-tight block">{pm.label}</span>
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest opacity-70">{pm.desc}</span>
                  </div>
                  {paymentMethod === pm.value && (
                    <div className="absolute -top-3 -right-3 animate-in zoom-in-50">
                       <CheckCircle2 className="h-8 w-8 text-primary fill-white" />
                    </div>
                  )}
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Summary */}
        <div className="lg:sticky lg:top-24 h-fit">
          <div className="rounded-[3rem] border border-border/40 bg-card p-10 shadow-2xl shadow-slate-200/50 space-y-8">
            <h2 className="text-2xl font-black italic tracking-tighter">Order Summary</h2>
            
            <div className="space-y-6 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {items.map((item) => (
                <div key={item.productId} className="flex justify-between items-center gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-black leading-tight text-slate-800 line-clamp-1">{item.name}</p>
                    <p className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/10 w-fit px-2 py-0.5 rounded-full">Qty: {item.quantity}</p>
                  </div>
                  <span className="text-sm font-black text-slate-700 italic shrink-0">₹{(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>

            <div className="space-y-4 pt-8 border-t border-dashed border-slate-200">
              <div className="flex justify-between text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                <span>Subtotal</span>
                <span className="text-slate-800">₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[11px] font-black text-green-600 uppercase tracking-[0.2em]">
                <span>Shipping</span>
                <span className="bg-green-100 px-2 py-0.5 rounded-full">Free</span>
              </div>
              <div className="pt-4 flex justify-between items-end border-t border-slate-100">
                <span className="text-sm font-black italic text-slate-500">Total Payable</span>
                <span className="text-4xl font-black text-primary italic tracking-tighter">₹{subtotal.toLocaleString()}</span>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              className="group w-full rounded-[2rem] bg-foreground py-6 font-black text-background hover:brightness-125 shadow-xl shadow-foreground/10 transition-all active:scale-[0.97] disabled:opacity-50 flex items-center justify-center gap-3 text-xl"
            >
              {loading ? (
                <Loader2 className="h-7 w-7 animate-spin text-primary" />
              ) : (
                <>
                  {paymentMethod === 'Razorpay' ? 'Secure Pay' : 'Confirm Order'}
                  <CheckCircle2 className="h-5 w-5 group-hover:scale-110 transition-transform" />
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">
              <ShieldCheck className="h-4 w-4" /> SSL Encrypted Checkout
            </div>
          </div>
        </div>
      </form>

      <PaymentModal 
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        amount={subtotal}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
};

export default CheckoutPage;