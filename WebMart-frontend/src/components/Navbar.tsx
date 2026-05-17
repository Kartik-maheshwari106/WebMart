import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Search, ShoppingCart, Menu, X, 
  LogOut, Package, LayoutDashboard, UserCircle, Home as HomeIcon 
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { totalItems, setIsOpen } = useCart();
  const navigate = useNavigate();
  const location = useLocation(); 
  const [search, setSearch] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);


  const isBusinessRole = 
    user?.role === 'SELLER' || 
    user?.role === 'ROLE_SELLER' || 
    user?.role === 'ADMIN' || 
    user?.role === 'ROLE_ADMIN' ||
    user?.role === 'DEVELOPER';

  const shouldShowSearch = 
    location.pathname === '/' || 
    location.pathname.startsWith('/product/');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) navigate(`/?search=${encodeURIComponent(search.trim())}`);
  };

  const getDashboardLink = () => {
    if (!user) return '/login';
    const role = user.role;
    if (role === 'ADMIN' || role === 'ROLE_ADMIN' || role === 'DEVELOPER') return '/admin';
    if (role === 'SELLER' || role === 'ROLE_SELLER') return '/seller';
    return '/dashboard';
  };

  const closeMenus = () => {
    setUserMenuOpen(false);
    setMobileOpen(false);
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
    return <span className="text-primary font-bold text-xs">{nameStr.charAt(0).toUpperCase()}</span>;
  };

  return (
    <nav className="sticky top-0 z-[100] border-b bg-card/80 backdrop-blur-md">
      <div className="container mx-auto flex items-center justify-between gap-4 px-4 py-3">
        {/* Logo */}
        <Link to="/" onClick={closeMenus} className="flex items-center gap-2 font-heading text-xl font-bold text-primary shrink-0">
          <Package className="h-6 w-6" />
          WebMart
        </Link>

        {/* Desktop Search */}
        {shouldShowSearch ? (
          <form onSubmit={handleSearch} className="hidden flex-1 max-w-lg md:flex animate-in fade-in duration-300">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full rounded-lg border bg-background py-2.5 pl-10 pr-4 text-sm outline-none ring-ring focus:ring-2 transition-all"
              />
            </div>
          </form>
        ) : (
          <div className="hidden md:block flex-1" />
        )}

        <div className="flex items-center gap-2">
          {/* Home Icon */}
          <Link 
            to="/" 
            onClick={closeMenus}
            className="rounded-lg p-2 hover:bg-muted text-muted-foreground hover:text-primary transition-colors"
          >
            <HomeIcon className="h-5 w-5" />
          </Link>

          {/* Cart Icon */}
          {(!isBusinessRole || user?.role === 'ADMIN' || user?.role === 'DEVELOPER') && (
            <button onClick={() => setIsOpen(true)} className="relative rounded-lg p-2 hover:bg-muted transition-colors">
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground">
                  {totalItems}
                </span>
              )}
            </button>
          )}

          {isAuthenticated ? (
            <div className="relative">
              <button 
                onClick={() => setUserMenuOpen(!userMenuOpen)} 
                className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-muted transition-colors border border-transparent"
              >
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 overflow-hidden shadow-sm">
                  {renderAvatar()}
                </div>
                <span className="hidden text-sm font-bold md:inline pr-1">
                  {user?.fullName || user?.name || 'User'}
                </span>
              </button>
              
              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40 h-screen w-screen" onClick={closeMenus} />
                  <div className="absolute right-0 z-50 mt-2 w-52 animate-in fade-in zoom-in-95 duration-200 rounded-2xl border bg-card p-2 shadow-xl">
                    <div className="px-3 py-3 border-b mb-1">
                       <p className="text-xs font-black text-muted-foreground uppercase tracking-tighter">Logged in as</p>
                       <p className="text-[11px] text-slate-500 truncate mt-0.5">{user?.role}</p>
                    </div>
                    
                    {/* Dashboard Link - Sabke liye */}
                    <Link to={getDashboardLink()} onClick={closeMenus} className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold hover:bg-primary/5 hover:text-primary transition-colors">
                      <LayoutDashboard className="h-4 w-4" /> Dashboard
                    </Link>

                    {/* ✅ FIXED: Ye link ab Admin ko bhi dikhega */}
                    <Link to="/profile" onClick={closeMenus} className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold hover:bg-primary/5 hover:text-primary transition-colors">
                      <UserCircle className="h-4 w-4" /> My Profile
                    </Link>
                    
                    {!isBusinessRole && (
                      <Link to="/orders" onClick={closeMenus} className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold hover:bg-primary/5 hover:text-primary transition-colors">
                        <Package className="h-4 w-4" /> My Orders
                      </Link>
                    )}
                    
                    <div className="border-t mt-1 pt-1">
                      <button 
                        onClick={() => { 
                          logout(); 
                          closeMenus();
                        }} 
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="h-4 w-4" /> Logout
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link to="/login" className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-all">
              Login
            </Link>
          )}

          <button onClick={() => setMobileOpen(!mobileOpen)} className="rounded-lg p-2 hover:bg-muted md:hidden">
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="border-t px-4 py-4 bg-card md:hidden animate-in slide-in-from-top duration-300">
          <div className="flex flex-col gap-1">
            <Link to="/" onClick={closeMenus} className="flex items-center gap-3 p-3 font-bold text-sm"> <HomeIcon className="h-5 w-5" /> Home </Link>
            {isAuthenticated && (
              <>
                <Link to="/profile" onClick={closeMenus} className="flex items-center gap-3 p-3 font-bold text-sm"> <UserCircle className="h-5 w-5" /> Profile </Link>
                <Link to={getDashboardLink()} onClick={closeMenus} className="flex items-center gap-3 p-3 font-bold text-sm"> <LayoutDashboard className="h-5 w-5" /> Dashboard </Link>
                {!isBusinessRole && (
                  <Link to="/orders" onClick={closeMenus} className="flex items-center gap-3 p-3 font-bold text-sm"> <Package className="h-5 w-5" /> Orders </Link>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;