import React, { useState, useEffect } from 'react';
import { 
  Package, Clock, Truck, CheckCircle, ShoppingBag, 
  XCircle, ChevronDown, ChevronUp, Box, MapPin, CreditCard, Loader2 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

const STATUS_STYLES: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  PENDING: { icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50' },
  SHIPPED: { icon: Truck, color: 'text-blue-600', bg: 'bg-blue-50' },
  DELIVERED: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
  CANCELLED: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
};

const OrderHistoryPage = () => {
  const { loading: authLoading, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);

  const fetchOrders = async () => {
    if (authLoading) return;
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await api.get('/orders/history');
      if (res.data && Array.isArray(res.data)) {
        setOrders(res.data);
      } else {
        setOrders([]);
      }
    } catch (error: any) {
      console.error("Order fetch error:", error);
      toast.error("Failed to load order history");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [authLoading, isAuthenticated]);

  const handleCancelOrder = async (e: React.MouseEvent, orderId: number) => {
    e.stopPropagation(); // Prevent toggling the accordion when clicking cancel
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    
    try {
      await api.put(`/orders/cancel/${orderId}`);
      toast.success("Order cancelled successfully");
      fetchOrders(); 
    } catch (err: any) {
      toast.error(err.response?.data || "Cancellation failed");
    }
  };

  const toggleOrderDetails = (orderId: number) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  if (authLoading || loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <Package className="mx-auto h-16 w-16 text-muted-foreground opacity-20 mb-4" />
        <h2 className="text-2xl font-bold tracking-tight">Access Denied</h2>
        <p className="text-muted-foreground mt-2">Please login to view your purchase history.</p>
        <Link to="/login" className="mt-6 inline-block bg-primary text-white px-8 py-2.5 rounded-lg font-bold shadow-lg transition-transform active:scale-95">
          Login to WebMart
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="flex items-center gap-4 mb-10">
        <div className="p-3 bg-primary/10 rounded-2xl">
          <ShoppingBag className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Order History</h1>
          <p className="text-sm text-muted-foreground">Manage and track your recent purchases</p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-24 bg-muted/20 rounded-[2rem] border-2 border-dashed border-muted">
          <Package className="h-14 w-14 mx-auto text-muted-foreground/30 mb-4" />
          <h3 className="text-xl font-bold text-muted-foreground">No orders found</h3>
          <p className="text-sm text-muted-foreground mt-1 mb-8">Your order list is currently empty.</p>
          <Link to="/" className="bg-primary text-white px-8 py-3 rounded-xl font-bold shadow-md hover:bg-primary/90 transition-all">
            Explore Marketplace
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const currentStatus = order.status?.toUpperCase() || 'PENDING';
            const st = STATUS_STYLES[currentStatus] || STATUS_STYLES.PENDING;
            const Icon = st.icon;
            const isExpanded = expandedOrderId === order.orderId;
            
            return (
              <div 
                key={order.orderId} 
                className={`overflow-hidden rounded-2xl border transition-all duration-200 ${isExpanded ? 'ring-2 ring-primary/20 shadow-lg' : 'bg-card shadow-sm hover:border-primary/30'}`}
              >
                {/* --- Order Summary Header --- */}
                <div 
                  onClick={() => toggleOrderDetails(order.orderId)}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-5 cursor-pointer bg-card"
                >
                  <div className="flex items-center gap-5">
                    <div className={`rounded-xl p-3.5 ${st.color} ${st.bg}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-lg">Order #{order.orderId}</p>
                        <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${st.bg} ${st.color}`}>
                          {currentStatus}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground font-medium mt-1">
                        Placed on {order.orderDate ? new Date(order.orderDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Date N/A'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4 sm:mt-0 gap-8">
                    <div className="sm:text-right">
                      <p className="font-black text-xl text-primary">₹{order.totalAmount?.toLocaleString()}</p>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">{order.items?.length || 0} Items</p>
                    </div>
                    {isExpanded ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
                  </div>
                </div>

                {/* --- Collapsible Order Details --- */}
                {isExpanded && (
                  <div className="border-t bg-muted/5 p-6 space-y-6 animate-in slide-in-from-top-2 duration-300">
                    {/* Items List */}
                    <div>
                      <h4 className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-4 flex items-center gap-2">
                        <Box className="h-3 w-3" /> Shipment Details
                      </h4>
                      <div className="space-y-3">
                        {order.items?.map((item: any, idx: number) => (
                          <div key={idx} className="flex items-center justify-between bg-background p-4 rounded-xl border border-muted shadow-sm">
                            <div className="flex items-center gap-4">
                              <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-primary/10 text-primary font-black text-xs">
                                {item.quantity}x
                              </div>
                              <div>
                                <p className="text-sm font-bold leading-tight">{item.productName}</p>
                                <p className="text-[11px] text-muted-foreground mt-1">Unit Price: ₹{item.priceAtPurchase?.toLocaleString()}</p>
                              </div>
                            </div>
                            <p className="text-sm font-black">₹{(item.priceAtPurchase * item.quantity).toLocaleString()}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Metadata: Address & Actions */}
                    <div className="grid sm:grid-cols-2 gap-6 pt-6 border-t border-dashed">
                      <div className="space-y-4">
                        <div className="flex gap-3">
                          <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                          <div>
                            <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-tighter">Delivery Address</p>
                            <p className="text-xs font-medium leading-relaxed mt-1">{order.address || 'Standard Shipping Address'}</p>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <CreditCard className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                          <div>
                            <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-tighter">Payment Method</p>
                            <p className="text-xs font-medium mt-1">{order.payment || 'Secured Payment'}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-end justify-end gap-3">
                        {currentStatus === 'PENDING' && (
                          <button 
                            onClick={(e) => handleCancelOrder(e, order.orderId)}
                            className="flex-1 sm:flex-none px-6 py-2.5 bg-red-50 text-red-600 text-xs font-black rounded-lg hover:bg-red-100 transition-all active:scale-95"
                          >
                            Cancel Request
                          </button>
                        )}
                        <button className="flex-1 sm:flex-none px-6 py-2.5 bg-secondary text-foreground text-xs font-black rounded-lg hover:bg-muted transition-all">
                          Download Invoice
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OrderHistoryPage;