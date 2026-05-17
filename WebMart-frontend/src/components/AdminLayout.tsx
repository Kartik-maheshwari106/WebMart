import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Package, ShoppingBag, Users, 
  Menu, X, ShieldCheck, LogOut, 
  ChevronRight, Zap, Loader2, UserCircle
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext'; 
import toast from 'react-hot-toast';

const links = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/products', icon: Package, label: 'Products' },
  { to: '/admin/orders', icon: ShoppingBag, label: 'Orders' },
  { to: '/admin/users', icon: Users, label: 'Users' },
];

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false); // 🚩 NEW: Dropdown state
  const { user, loading, logout } = useAuth(); 
  const location = useLocation();
  const navigate = useNavigate();

  const isAdmin = user?.role?.toUpperCase().includes('ADMIN') || 
                  user?.role?.toUpperCase().includes('DEVELOPER');

  useEffect(() => {
    if (!loading && !isAdmin) {
      toast.error("Security Breach: Unauthorized Access Blocked", { id: 'admin-denied' });
      const timer = setTimeout(() => navigate('/'), 3000);
      return () => clearTimeout(timer);
    }
  }, [isAdmin, loading, navigate]);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("System Signed Out Safely");
      navigate('/login');
    } catch (error) {
      toast.error("Logout failed");
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#0F172A] text-white">
        <Loader2 className="animate-spin text-primary mb-4" size={40} />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] animate-pulse">Verifying Admin Node...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#0F172A] text-white p-6 text-center">
        <ShieldCheck size={100} className="text-rose-500 animate-bounce" />
        <h1 className="text-4xl font-black tracking-tighter mt-8 bg-gradient-to-r from-rose-400 to-orange-500 bg-clip-text text-transparent uppercase">403: ACCESS DENIED</h1>
        <p className="text-slate-400 mt-4 max-w-md font-medium italic">Credentials mismatch. Detected Role: <span className="text-rose-400">[{user?.role || 'GUEST'}]</span>.</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans text-slate-900">
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-md lg:hidden transition-all" onClick={() => setSidebarOpen(false)} />
      )}

      {/* SIDEBAR */}
      <aside className={`fixed z-50 flex h-full w-72 flex-col bg-white border-r border-slate-200 transition-all duration-500 lg:static lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="px-8 pt-10 pb-8">
          <div className="flex items-center gap-4 group cursor-pointer" onClick={() => navigate('/')}>
            <div className="h-12 w-12 bg-slate-900 rounded-2xl flex items-center justify-center shadow-2xl group-hover:rotate-12 transition-transform">
              <Zap className="text-primary fill-primary" size={24} />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xl font-black tracking-tighter text-slate-900 uppercase">WebMart</span>
              <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Staff Node</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto mt-4">
          <p className="px-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 mb-4">Core Systems</p>
          {links.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <Link key={link.to} to={link.to} onClick={() => setSidebarOpen(false)} className={`flex items-center justify-between group rounded-2xl px-6 py-4 transition-all ${isActive ? 'bg-slate-900 text-white shadow-2xl scale-[1.02]' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}>
                <div className="flex items-center gap-4">
                  <link.icon size={20} className={isActive ? 'text-primary' : 'group-hover:text-primary'} /> 
                  <span className="text-sm font-bold">{link.label}</span>
                </div>
                {isActive && <ChevronRight size={14} className="text-primary" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-6 mt-auto">
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-3 py-4 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition-all font-black text-xs uppercase tracking-widest shadow-sm">
            <LogOut size={16} /> Log Out
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* 🚀 FIXED HEADER WITH DROPDOWN */}
        <header className="h-24 flex items-center justify-between px-8 bg-white/70 backdrop-blur-xl border-b border-slate-100 z-30">
          <div className="flex items-center gap-6">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden h-12 w-12 flex items-center justify-center bg-slate-900 text-white rounded-2xl shadow-xl">
              <Menu size={24} />
            </button>
            <div className="hidden sm:block text-left">
              <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                <span>Network</span> <ChevronRight size={10} /> <span className="text-primary">Admin</span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tighter mt-1 italic">
                {links.find(l => l.to === location.pathname)?.label || "Control Tower"}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden lg:flex flex-col items-end mr-2 text-right">
              <span className="text-xs font-black text-slate-900">{user?.fullName || 'Administrator'}</span>
              <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-tighter">Verified Node</span>
            </div>
            
            {/* 🚩 DROPDOWN TOGGLE */}
            <div className="relative">
              <div 
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="h-14 w-14 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 p-[2px] cursor-pointer shadow-lg active:scale-95 transition-transform"
              >
                <div className="h-full w-full bg-white rounded-[calc(1rem-2px)] flex items-center justify-center overflow-hidden">
                  <div className="h-full w-full bg-slate-900 flex items-center justify-center text-primary font-black text-lg">
                    {user?.fullName?.charAt(0) || 'A'}
                  </div>
                </div>
              </div>
              
              {/* Green Dot */}
              <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-primary border-4 border-white rounded-full" />

              {/* 🚩 ACTUAL DROPDOWN MENU */}
              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                  <div className="absolute right-0 z-50 mt-4 w-52 rounded-2xl border bg-white p-2 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                    <Link to="/" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-primary transition-colors">
                      <Zap size={16} /> WebMart Home
                    </Link>
                    <Link to="/profile" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-primary transition-colors">
                      <UserCircle size={16} /> My Profile
                    </Link>
                    <div className="border-t my-1" />
                    <button onClick={handleLogout} className="flex w-full items-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-rose-600 hover:bg-rose-50 transition-colors">
                      <LogOut size={16} /> Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-[#F8FAFC] p-8 lg:p-12 scroll-smooth">
          <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Outlet context={{ user }} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;