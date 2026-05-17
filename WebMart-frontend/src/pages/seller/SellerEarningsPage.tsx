import React, { useState, useEffect } from 'react';
import { IndianRupee, TrendingUp, Clock, CheckCircle, Download, ArrowUpRight, Loader2 } from 'lucide-react';
import api from '@/lib/api';

const SellerEarningsPage = () => {
  const [stats, setStats] = useState({ totalRevenue: 0, totalProductsSold: 0 });
  const [recentSales, setRecentSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [statsRes, salesRes] = await Promise.all([
          api.get('/seller/stats'),
          api.get('/seller/recent-sales')
        ]);
        setStats(statsRes.data);
        setRecentSales(salesRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight uppercase italic">Money Dashboard</h1>
          <p className="text-muted-foreground mt-1">Real-time revenue tracking for your shop.</p>
        </div>
        <button className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-2xl font-black shadow-lg shadow-primary/20">
          <Download className="h-4 w-4" /> EXPORT REPORT
        </button>
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        <StatCard title="Products Sold" value={stats.totalProductsSold} icon={<TrendingUp className="text-blue-500" />} subtitle="Lifetime units" />
        <StatCard title="Unpaid Balance" value="₹0" icon={<Clock className="text-amber-500" />} subtitle="Processing" />
        <StatCard 
          title="Total Revenue" 
          value={`₹${stats.totalRevenue.toLocaleString()}`} 
          icon={<CheckCircle className="text-emerald-500" />} 
          subtitle="Net Earnings" 
          highlight={true} 
        />
      </div>

      <div className="rounded-3xl border bg-card shadow-sm overflow-hidden">
        <div className="p-6 border-b bg-muted/10 font-black uppercase text-sm tracking-widest flex justify-between">
          Transaction History
          <span className="text-primary">{recentSales.length} Total</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/30 text-muted-foreground uppercase text-[11px] font-black">
              <tr>
                <th className="px-6 py-4 text-left">Sale Detail</th>
                <th className="px-6 py-4 text-center">Units</th>
                <th className="px-6 py-4 text-right">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {recentSales.map((s, i) => (
                <tr key={i} className="hover:bg-muted/30 transition-all group">
                  <td className="px-6 py-4 font-bold">PID-{s.productId}</td>
                  <td className="px-6 py-4 text-center font-black">{s.quantity}</td>
                  <td className="px-6 py-4 text-right font-black text-emerald-600 text-lg">₹{(s.price * s.quantity).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, subtitle, highlight = false }) => (
  <div className={`p-8 rounded-[32px] border bg-card shadow-sm transition-all ${highlight ? 'ring-4 ring-primary/10 border-primary/50 bg-primary/5' : ''}`}>
    <div className="flex items-center justify-between mb-4">
      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{title}</span>
      <div className="p-3 bg-white rounded-2xl shadow-sm border">{icon}</div>
    </div>
    <div className="flex items-baseline gap-2">
      <div className="text-4xl font-black tracking-tighter">{value}</div>
      {highlight && <ArrowUpRight className="h-5 w-5 text-emerald-500" />}
    </div>
    <p className="text-[10px] text-muted-foreground mt-3 font-bold uppercase tracking-tighter">{subtitle}</p>
  </div>
);

export default SellerEarningsPage;