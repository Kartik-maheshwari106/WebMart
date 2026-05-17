import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, Search, ExternalLink, PackageCheck, 
  Download, Inbox, Loader2
} from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const STATUSES = ['Pending', 'Out for Delivery', 'Delivered', 'Cancelled'];

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/orders/all'); 

      console.log("Fetched Orders Data:", res.data);
      setOrders(res.data || []);
    } catch (err) {
      console.error("Orders Fetch Error:", err);
      toast.error("Database sync failed");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId: string, newStatus: string) => {
    try {

      setOrders((prev) => 
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus, orderStatus: newStatus } : o))
      );


      await api.put(`/orders/update-status/${orderId}`, { newStatus });
      
      toast.success(`Order ${orderId} updated to ${newStatus}`, {
        style: { borderRadius: '15px', background: '#333', color: '#fff', fontSize: '11px' }
      });
    } catch (err: any) {
      toast.error("Sync failed, reverting...");
      fetchOrders(); // Revert on error
    }
  };


  const getOrderValue = (order: any) => {

    const val = order.status || order.orderStatus || order.deliveryStatus || 'Pending';
    

    const match = STATUSES.find(s => s.toLowerCase() === val.toString().toLowerCase());
    return match || 'Pending';
  };

  const getStatusStyle = (status: string) => {
    const s = (status || '').toUpperCase();
    if (s.includes('DELIVERED')) return 'bg-emerald-50 text-emerald-600 border-emerald-100 shadow-[0_0_15px_rgba(16,185,129,0.1)]';
    if (s.includes('DELIVERY')) return 'bg-blue-50 text-blue-600 border-blue-100 shadow-[0_0_15px_rgba(59,130,246,0.1)]';
    if (s.includes('PENDING')) return 'bg-amber-50 text-amber-600 border-amber-100 shadow-[0_0_15px_rgba(245,158,11,0.1)]';
    if (s.includes('CANCEL')) return 'bg-rose-50 text-rose-600 border-rose-100 shadow-[0_0_15px_rgba(244,63,94,0.1)]';
    return 'bg-slate-50 text-slate-600 border-slate-100';
  };

  const filteredOrders = orders.filter(o => 
    o.id.toString().toLowerCase().includes(searchTerm.toLowerCase()) || 
    (o.buyer|| '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 text-white">
            <Inbox size={12} className="text-primary" />
            <span className="text-[9px] font-black uppercase tracking-[0.2em]">Platform Fulfillment</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tightest">
            Order <span className="text-primary italic">Ledger.</span>
          </h1>
          <p className="text-slate-400 font-medium text-sm">Transaction History</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
            <input 
              type="text" 
              placeholder="Search ID or Customer..."
              className="pl-12 pr-6 py-4 rounded-2xl border-2 border-slate-100 bg-white text-sm font-bold focus:border-primary/20 outline-none w-full md:w-72 transition-all shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* --- DATA TABLE --- */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center gap-4">
            <Loader2 className="animate-spin text-primary" size={40} />
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-300 italic">Syncing DB...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Order Reference</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Customer Details</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Net Total</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Status</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                </tr>
              </thead>
              
              <tbody className="divide-y divide-slate-50">
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((o) => {
                    const activeStatus = getOrderValue(o);

                    return (
                      <tr key={o.id} className="group hover:bg-slate-50/50 transition-all duration-300">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-primary/10 group-hover:text-primary transition-all">
                              <PackageCheck size={22} />
                            </div>
                            <div className="flex flex-col">
                               <span className="font-black text-slate-900 text-sm italic">#{o.id}</span>
                               <span className="text-[10px] font-bold text-slate-400 uppercase">{o.date || 'RECENT'}</span>
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-8 py-6">
                          <div className="flex flex-col">
                             <span className="text-sm font-black text-slate-700 tracking-tight">{o.customer || 'Guest User'}</span>
                             <span className="text-[11px] text-slate-400 italic lowercase">{o.email || 'no-email@webmart.com'}</span>
                          </div>
                        </td>

                        <td className="px-8 py-6 text-center">
                          <span className="text-xs font-black bg-slate-900 text-white px-3 py-1.5 rounded-xl">
                            ₹{(o.total || 0).toLocaleString()}
                          </span>
                        </td>

                        <td className="px-8 py-6">
                          <div className="flex justify-center">
                            <select

                              value={activeStatus}
                              onChange={(e) => updateStatus(o.id, e.target.value)}
                              className={`px-4 py-2 rounded-2xl border text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer transition-all ${getStatusStyle(activeStatus)}`}
                            >
                              {STATUSES.map((s) => (
                                <option key={s} value={s} className="bg-white text-slate-900">
                                  {s}
                                </option>
                              ))}
                            </select>
                          </div>
                        </td>

                        <td className="px-8 py-6 text-right">
                          <button className="p-3 bg-white border border-slate-100 rounded-xl hover:text-primary transition-all">
                             <ExternalLink size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="px-8 py-32 text-center text-slate-300 font-black uppercase text-xs italic tracking-[0.3em]">
                      No Records in Database
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrdersPage;