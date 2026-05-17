import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  Package, ShoppingBag, DollarSign, Menu, X, 
  LayoutGrid, PlusCircle, LogOut, LayoutDashboard, UserCircle, Home as HomeIcon 
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const links = [
  { to: '/seller', icon: LayoutGrid, label: 'Overview' },
  { to: '/seller/products', icon: Package, label: 'My Inventory' },
  { to: '/seller/products?add=true', icon: PlusCircle, label: 'Add New Product' },
  { to: '/seller/orders', icon: ShoppingBag, label: 'Manage Orders' },
  { to: '/seller/earnings', icon: DollarSign, label: 'Earnings' },
];

const SellerLayout = () => {

  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isLinkActive = (linkTo: string) => {
    const currentPath = location.pathname;
    const currentSearch = location.search;
    const fullURL = currentPath + currentSearch;
    return fullURL === linkTo || (!linkTo.includes('?') && currentPath === linkTo && currentSearch === '');
  };

  const getDashboardLink = () => {
    if (!user) return '/login';
    const role = user.role;
    if (role === 'ADMIN' || role === 'ROLE_ADMIN' || role === 'DEVELOPER') return '/admin';
    if (role === 'SELLER' || role === 'ROLE_SELLER') return '/seller';
    return '/dashboard';
  };

  const renderAvatar = () => {

    const imgPath = 
      user?.profileImageUrl || 
      user?.profilePic || 
      user?.image || 
      user?.avatar;

    if (imgPath && typeof imgPath === 'string' && imgPath.startsWith('http')) {
      return (
        <img 
          src={imgPath} 
          alt="Profile" 
          className="h-full w-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      );
    }

    const nameStr = user?.fullName || user?.name || user?.email || "U";
    const initial = nameStr.charAt(0).toUpperCase();
    return <span className="text-primary font-bold text-xs">{isNaN(Number(initial)) ? initial : 'U'}</span>;
  };

  return (
    <div className="flex min-h-screen bg-[#f8f9fa]">
      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-[95] bg-black/20 backdrop-blur-sm lg:hidden" 
          onClick={() => setSidebarOpen(false)} 
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-[100] w-64 bg-white border-r transition-transform duration-300 lg:static lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b flex justify-between items-center">
          <span className="text-xl font-black italic text-primary">WEBMART PRO</span>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400"><X size={20} /></button>
        </div>
        <nav className="p-4 space-y-1">
          {links.map((link) => (
            <Link 
              key={link.to} to={link.to} onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${isLinkActive(link.to) ? 'bg-primary text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              <link.icon size={18} /> {link.label}
            </Link>
          ))}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="sticky top-0 z-[90] flex items-center justify-between border-b bg-white/80 backdrop-blur-md px-6 py-3">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg bg-slate-100 text-slate-600"><Menu size={20} /></button>
            <h2 className="font-black text-lg uppercase text-slate-800 hidden sm:block">
              {links.find(l => isLinkActive(l.to))?.label || 'Seller Panel'}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/" className="rounded-lg p-2 hover:bg-muted text-muted-foreground hover:text-primary transition-colors">
              <HomeIcon className="h-5 w-5" />
            </Link>

            {/* User Menu */}
            <div className="relative">
              <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="flex items-center gap-2 rounded-xl p-1.5 hover:bg-muted transition-colors border border-transparent">
                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 overflow-hidden shadow-sm">
                  {renderAvatar()}
                </div>
                <div className="hidden md:flex flex-col items-start leading-tight pr-2">
                  <span className="text-[13px] font-black text-slate-900">
                    {user?.fullName || user?.name || 'Seller'}
                  </span>
                </div>
              </button>

              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                  <div className="absolute right-0 z-50 mt-2 w-56 animate-in fade-in zoom-in-95 duration-200 rounded-2xl border bg-white p-2 shadow-2xl">
                    <div className="px-4 py-4 border-b border-slate-50 mb-1 bg-slate-50/50 rounded-xl">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Logged in as</p>
                       <p className="text-xs font-bold text-slate-600 truncate mt-0.5">{user?.role}</p>
                    </div>
                    
                    <Link to={getDashboardLink()} onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-primary/5 hover:text-primary transition-colors">
                      <LayoutDashboard size={18} /> Dashboard
                    </Link>

                    <Link to="/profile" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-primary/5 hover:text-primary transition-colors">
                      <UserCircle size={18} /> My Profile
                    </Link>
                    
                    <div className="border-t mt-1 pt-1">
                      <button 
                        onClick={() => { logout(); setUserMenuOpen(false); }} 
                        className="flex w-full items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut size={18} /> Logout
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="p-6 lg:p-10 flex-1 overflow-y-auto bg-[#f8f9fa]">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default SellerLayout;