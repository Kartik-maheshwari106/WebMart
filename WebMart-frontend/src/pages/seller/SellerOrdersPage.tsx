import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Loader2, 
  ShoppingBag, 
  CircleDollarSign, 
  Calendar,
  ChevronRight,
  ArrowUpRight
} from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const SellerOrdersPage = () => {
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSales = async () => {
    try {
      setLoading(true);

      const res = await api.get('/seller/recent-sales');
      setSales(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Orders fetch karne mein dikkat hui.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, []);

  if (loading) return (
    <div className="h-[60vh] flex flex-col items-center justify-center text-primary">
      <Loader2 className="animate-spin h-10 w-10 mb-2" />
      <p className="font-black uppercase tracking-widest text-[10px]">Loading Orders...</p>
    </div>
  );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black uppercase italic tracking-tighter text-slate-900 flex items-center gap-3">
            <ShoppingBag className="h-10 w-10 text-primary" /> Manage Orders
          </h1>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-1 bg-slate-100 inline-block px-3 py-1 rounded-lg">
            Active Sales: {sales.length} Transactions
          </p>
        </div>
        
        <div className="flex gap-4">
            <div className="bg-white p-4 rounded-[25px] border border-slate-100 shadow-sm flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                    <CircleDollarSign size={20} />
                </div>
                <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase">Total Revenue</p>
                    <p className="font-black text-lg text-slate-800">
                        ₹{sales.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0).toLocaleString()}
                    </p>
                </div>
            </div>
        </div>
      </div>

      {/* Orders Table Section */}
      <div className="bg-white rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-6 text-[11px] font-black uppercase text-slate-400 tracking-widest">Order Info</th>
                <th className="px-8 py-6 text-[11px] font-black uppercase text-slate-400 tracking-widest">Customer</th>
                <th className="px-8 py-6 text-[11px] font-black uppercase text-slate-400 tracking-widest text-center">Qty</th>
                <th className="px-8 py-6 text-[11px] font-black uppercase text-slate-400 tracking-widest text-right">Earnings</th>
                <th className="px-8 py-6 text-[11px] font-black uppercase text-slate-400 tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {sales.length > 0 ? (
                sales.map((item, i) => (
                  <tr key={i} className="group hover:bg-slate-50/50 transition-all duration-300">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                          <Package size={24} />
                        </div>
                        <div>
                          <p className="font-black text-slate-800 uppercase text-sm tracking-tight">PID-{item.productId}</p>
                          <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1 uppercase">
                             <Calendar size={10} /> Recently Sold
                          </p>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-700 text-sm">{item.buyerEmail || 'Guest User'}</span>
                        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-tighter bg-emerald-50 w-fit px-2 py-0.5 rounded-md mt-1">
                            Paid Successfully
                        </span>
                      </div>
                    </td>

                    <td className="px-8 py-6 text-center">
                      <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-slate-100 font-black text-xs text-slate-600">
                        {item.quantity}
                      </span>
                    </td>

                    <td className="px-8 py-6 text-right">
                      <div className="flex flex-col items-end">
                        <span className="font-black text-slate-900 text-base italic">₹{(item.price * item.quantity).toLocaleString()}</span>
                        <span className="text-[9px] font-bold text-slate-400 uppercase">Unit: ₹{item.price}</span>
                      </div>
                    </td>

                    <td className="px-8 py-6 text-right">
                       <button className="p-3 rounded-xl bg-slate-100 text-slate-400 hover:bg-primary hover:text-white transition-all duration-300 shadow-sm">
                          <ArrowUpRight size={18} />
                       </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-8 py-32 text-center">
                    <div className="flex flex-col items-center justify-center opacity-20">
                        <Package size={80} className="mb-4" />
                        <h3 className="text-2xl font-black uppercase italic tracking-tighter">No Sales Found</h3>
                        <p className="text-xs font-bold uppercase tracking-widest">Your store is waiting for its first order!</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Footer Info */}
      <div className="bg-slate-900 rounded-[30px] p-8 text-white flex items-center justify-between overflow-hidden relative">
          <div className="relative z-10">
              <h4 className="text-xl font-black uppercase italic leading-none">Daily Insights</h4>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-2">Check your earnings dashboard for deep analytics</p>
          </div>
          <button className="relative z-10 px-6 py-3 bg-white text-slate-900 font-black uppercase text-xs rounded-xl hover:scale-105 transition-transform flex items-center gap-2">
              View Analytics <ChevronRight size={14} />
          </button>
          {/* Decorative Circle */}
          <div className="absolute -right-10 -bottom-10 h-40 w-40 bg-primary/20 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
};

export default SellerOrdersPage;