import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, Clock, ChevronRight, Package, 
  Loader2, TrendingUp, Wallet, CheckCircle2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

const BuyerDashboard = () => {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (authLoading || !isAuthenticated) return;
      
      setLoading(true);
      try {
        const res = await api.get('/orders/history');
        if (res.data && Array.isArray(res.data)) {
          setOrders(res.data);
        }
      } catch (error) {
        console.error("Dashboard data fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [authLoading, isAuthenticated]);


  

  const totalSpent = orders
    .filter(o => o.status === 'DELIVERED')
    .reduce((acc, o) => acc + (o.totalAmount || 0), 0);
  

  const pendingOrders = orders.filter(o => 
    o.status === 'PENDING' || o.status === 'SHIPPED' || o.status === 'PROCESSING'
  ).length;
  

  const successfulOrders = orders.filter(o => o.status === 'DELIVERED').length;
  
  const recentOrders = orders.slice(0, 5);

  if (authLoading || loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-6xl">
      <div className="mb-10">
        <h1 className="text-3xl font-black tracking-tight">
          Welcome back, {(user as any)?.fullName || 'User'}
        </h1>
        <p className="text-muted-foreground mt-1 text-sm font-medium">
          Monitor your orders and spending activity.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {/* Total Spent Card */}
        <div className="bg-primary text-white rounded-[2rem] p-8 shadow-xl shadow-primary/20 relative overflow-hidden group">
          <div className="relative z-10">
            <p className="text-xs font-bold uppercase tracking-widest opacity-70">Total Investment</p>
            <h3 className="text-4xl font-black mt-2">₹{totalSpent.toLocaleString()}</h3>
            <div className="mt-6 inline-flex items-center gap-2 text-[10px] bg-white/20 px-3 py-1.5 rounded-full font-bold uppercase">
              <TrendingUp className="h-3 w-3" /> Delivered Value
            </div>
          </div>
          <Wallet className="absolute -right-6 -bottom-6 h-32 w-32 opacity-10 group-hover:rotate-12 transition-transform duration-500" />
        </div>

        {/* Successful Orders Card */}
        <div className="bg-card border-2 border-green-100 rounded-[2rem] p-8 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
          <div className="relative z-10">
            <p className="text-xs font-bold uppercase tracking-widest text-green-600">Successful Purchases</p>
            <h3 className="text-4xl font-black mt-2 text-green-700">{successfulOrders}</h3>
            <div className="mt-6 inline-flex items-center gap-2 text-[10px] bg-green-50 text-green-700 px-3 py-1.5 rounded-full font-bold uppercase">
              <CheckCircle2 className="h-3 w-3" /> Delivered
            </div>
          </div>
          <Package className="absolute -right-6 -bottom-6 h-32 w-32 text-green-600 opacity-5 group-hover:-translate-y-2 transition-transform duration-500" />
        </div>

        {/* Pending Orders Card */}
        <div className="bg-card border-2 border-yellow-100 rounded-[2rem] p-8 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
          <div className="relative z-10">
            <p className="text-xs font-bold uppercase tracking-widest text-yellow-600">Active Shipments</p>
            <h3 className="text-4xl font-black mt-2 text-yellow-700">{pendingOrders}</h3>
            <div className="mt-6 inline-flex items-center gap-2 text-[10px] bg-yellow-50 text-yellow-700 px-3 py-1.5 rounded-full font-bold uppercase">
              <Clock className="h-3 w-3" /> In Progress
            </div>
          </div>
          <ShoppingBag className="absolute -right-6 -bottom-6 h-32 w-32 text-yellow-600 opacity-5 group-hover:scale-110 transition-transform duration-500" />
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h2 className="font-black text-2xl flex items-center gap-3">
            <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <Package className="h-5 w-5 text-primary" />
            </div>
            Recent Transactions
          </h2>
          <Link to="/orders" className="text-sm font-black text-primary hover:bg-primary/5 px-4 py-2 rounded-xl flex items-center gap-1 transition-colors">
            View All Orders <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="bg-card border rounded-[1.5rem] overflow-hidden shadow-sm">
          {recentOrders.length > 0 ? (
            <div className="divide-y border-t-0">
              {recentOrders.map((order) => (
                <div key={order.orderId} className="p-6 hover:bg-muted/30 transition-colors flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-5 w-full sm:w-auto">
                    <div className="h-12 w-12 rounded-2xl bg-secondary flex items-center justify-center shrink-0">
                      <Package className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-bold text-base">Transaction #{order.orderId}</p>
                      <p className="text-xs text-muted-foreground font-medium">
                        Processed on {new Date(order.orderDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between w-full sm:w-auto sm:gap-12 border-t sm:border-0 pt-4 sm:pt-0">
                    <div className="sm:text-right">
                      <p className="font-black text-lg">₹{order.totalAmount?.toLocaleString()}</p>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">{order.items?.length || 0} Products</p>
                    </div>
                    <div className="text-right">
                      <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${
                        order.status === 'CANCELLED' ? 'bg-red-50 text-red-600' : 
                        order.status === 'DELIVERED' ? 'bg-green-50 text-green-600' :
                        'bg-primary/10 text-primary'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-20 text-center text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p className="font-bold">Your transaction history is empty.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BuyerDashboard;