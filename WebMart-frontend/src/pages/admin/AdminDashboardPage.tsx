import React, { useState, useEffect, useMemo } from 'react';
import { 
  Package, ShoppingBag, Users, TrendingUp, 
  ArrowUpRight, ArrowDownRight, Activity, ShieldCheck,
  Loader2, RefreshCcw, Layers, Globe, AlertTriangle
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer 
} from 'recharts';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

const AdminDashboardPage = () => {
  const { user, loading: authLoading } = useAuth();
  
  const [stats, setStats] = useState<any>({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
    growth: { products: 0, orders: 0, users: 0, revenue: 0 },
    chartData: []
  });
  
  const [fetching, setFetching] = useState(true);
  const [apiError, setApiError] = useState(false);

  const isAdmin = useMemo(() => {
    if (!user) return false;
    const role = user.role?.toUpperCase() || "";
    return role.includes('ADMIN') || role.includes('DEVELOPER');
  }, [user]);

  const fetchAdminStats = async () => {
    try {
      setFetching(true);
      setApiError(false);
      
      const res = await api.get('/admin/stats'); 
      
      if (res.data) {
        setStats(res.data);

        if (!fetching) toast.success("Metrics Synchronized");
      }
    } catch (err: any) {
      setApiError(true);
      const status = err.response?.status;
      if (status === 403) {
        console.error("CRITICAL: Access Denied to Control Tower.");
      } else {
        toast.error("Metrics synchronization failed.");
      }
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (!authLoading && isAdmin) {
      fetchAdminStats();
    } else if (!authLoading && !isAdmin) {
      setFetching(false);
    }
  }, [isAdmin, authLoading]);


  const formatRevenue = (val: number) => {
    if (val >= 100000) {
      return `₹${(val / 100000).toFixed(2)}L`;
    }
    return `₹${val.toLocaleString('en-IN')}`;
  };

  if (authLoading || (fetching && isAdmin)) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center gap-6 bg-white rounded-[3rem]">
        <div className="relative">
            <Loader2 className="animate-spin text-primary" size={64} strokeWidth={1} />
            <div className="absolute inset-0 m-auto h-2 w-2 rounded-full bg-primary animate-ping" />
        </div>
        <p className="font-black uppercase italic tracking-[0.4em] text-[10px] text-slate-400 animate-pulse">Initializing Control Tower...</p>
      </div>
    );
  }

  if (!isAdmin || apiError) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center gap-4 bg-rose-50/30 rounded-[3rem] border-2 border-dashed border-rose-100 p-10 text-center">
        <AlertTriangle size={48} className="text-rose-500 mb-2" />
        <h2 className="text-2xl font-black text-slate-900 uppercase italic">Access Denied</h2>
        <p className="max-w-md text-slate-500 text-sm font-medium">
          Clearance Level Error: {user?.role || 'Guest'} detected. Admin or Developer credentials required for node access.
        </p>
        <button 
          onClick={() => window.location.href = '/'}
          className="mt-6 px-8 py-3 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all"
        >
          Return to Base
        </button>
      </div>
    );
  }

  const statCards = [
    { label: 'Platform Inventory', value: stats.totalProducts || 0, change: stats.growth?.products || 0, icon: Package, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Global Orders', value: stats.totalOrders || 0, change: stats.growth?.orders || 0, icon: ShoppingBag, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Active Citizens', value: stats.totalUsers || 0, change: stats.growth?.users || 0, icon: Users, color: 'text-violet-600', bg: 'bg-violet-50' },

    { label: 'Total Gross', value: formatRevenue(stats.totalRevenue || 0), change: stats.growth?.revenue || 0, icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  return (
    <div className="p-4 space-y-10 animate-in fade-in zoom-in-95 duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 text-white shadow-lg shadow-slate-200">
            <ShieldCheck size={14} className="text-primary" />
            <span className="text-[9px] font-black uppercase tracking-[0.2em]">System Node: Secure</span>
          </div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tightest uppercase italic">
            Control <span className="text-primary not-italic">Tower.</span>
          </h1>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-tight">Metrics & Command Center</p>
        </div>
        
        <button 
          onClick={fetchAdminStats} 
          disabled={fetching}
          className="group flex items-center gap-3 px-6 py-4 rounded-2xl bg-white border-2 border-slate-100 hover:border-primary/20 transition-all active:scale-95 disabled:opacity-50 shadow-sm"
        >
          <RefreshCcw size={18} className={`text-slate-400 ${fetching ? 'animate-spin' : 'group-hover:rotate-180'} transition-transform duration-700`} />
          <span className="text-xs font-black uppercase tracking-widest text-slate-600">Sync System</span>
        </button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <div key={stat.label} className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="flex justify-between items-start">
              <div className={`p-4 rounded-3xl ${stat.bg} ${stat.color} shadow-inner`}>
                <stat.icon size={28} />
              </div>
              <div className={`flex items-center gap-1 text-[10px] font-black px-3 py-1 rounded-full ${stat.change >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                {stat.change >= 0 ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                {Math.abs(stat.change)}%
              </div>
            </div>
            <div className="mt-8 space-y-1">
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 italic">{stat.label}</p>
              <h3 className="text-4xl font-black text-slate-900 tracking-tighter tabular-nums">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-xl font-black flex items-center gap-3 tracking-tight uppercase italic">
               <Activity className="text-primary" /> Revenue Stream
               </h3>
            </div>
            <div className="h-[320px] w-full">
              {stats.chartData && stats.chartData.length > 0 ? (
                 <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={stats.chartData}>
                     <defs>
                       <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                         <stop offset="5%" stopColor="#ff4d4d" stopOpacity={0.3}/>
                         <stop offset="95%" stopColor="#ff4d4d" stopOpacity={0}/>
                       </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                     <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 'bold'}} />
                     <YAxis hide />
                     <Tooltip contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold'}} />
                     <Area type="monotone" dataKey="revenue" stroke="#ff4d4d" fill="url(#colorRev)" strokeWidth={4} />
                   </AreaChart>
                 </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-4 border-2 border-dashed border-slate-100 rounded-[2rem]">
                   <Layers className="opacity-20" size={48} />
                   <p className="font-black text-[10px] uppercase tracking-[0.2em]">Awaiting Transaction History...</p>
                </div>
              )}
            </div>
        </div>

        <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl shadow-slate-900/40 border border-white/5">
          <h3 className="text-2xl font-black mb-8 tracking-tight flex items-center gap-3 uppercase italic">
            Vitals <div className="h-2 w-12 rounded-full bg-gradient-to-r from-primary to-transparent" />
          </h3>
          <div className="space-y-4">
            {[
              { label: 'Cloud Database', status: 'Optimal', icon: Globe, color: 'text-emerald-400' },
              { label: 'Security Gateway', status: 'Stable', icon: ShieldCheck, color: 'text-primary' },
              { label: 'Logic Cluster', status: 'Encrypted', icon: Layers, color: 'text-blue-400' }
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between p-5 rounded-2xl bg-white/5 border border-white/10 group hover:bg-white/10 transition-colors cursor-default">
                <div className="flex items-center gap-4">
                  <item.icon size={18} className={item.color} />
                  <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
                </div>
                <span className={`text-[9px] font-black uppercase tracking-tighter ${item.color}`}>{item.status}</span>
              </div>
            ))}
          </div>
          <div className="mt-12 p-6 bg-gradient-to-br from-white/5 to-transparent rounded-[2rem] border border-white/10 relative overflow-hidden">
            <p className="text-[9px] text-slate-400 leading-relaxed font-bold uppercase tracking-tight">Admin Protocol 4.0.2</p>
            <p className="mt-2 text-[11px] text-slate-300 font-medium">Logged securely.</p>
            <Activity className="absolute -right-4 -bottom-4 text-white/5 rotate-12" size={120} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;