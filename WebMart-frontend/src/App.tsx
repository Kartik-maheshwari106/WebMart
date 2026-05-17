import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/context/AuthContext"; 
import { CartProvider } from "@/context/CartContext";
import toast from "react-hot-toast";


import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartSidebar from "@/components/CartSidebar";
import AdminLayout from "@/components/AdminLayout";
import SellerLayout from "@/components/SellerLayout";


import HomePage from "@/pages/HomePage";
import ProductDetailPage from "@/pages/ProductDetailPage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import OTPVerificationPage from "@/pages/OTPVerificationPage";
import ForgotPasswordPage from "@/pages/ForgotPasswordPage";
import NotFound from "@/pages/NotFound";


import CheckoutPage from "@/pages/CheckoutPage";
import OrderHistoryPage from "@/pages/OrderHistoryPage";
import BuyerDashboard from "@/pages/BuyerDashboard";
import ProfilePage from "@/pages/ProfilePage";


import AdminDashboardPage from "@/pages/admin/AdminDashboardPage";
import AdminProductsPage from "@/pages/admin/AdminProductsPage";
import AdminOrdersPage from "@/pages/admin/AdminOrdersPage";
import AdminUsersPage from "@/pages/admin/AdminUsersPage";


import SellerProductsPage from "@/pages/seller/SellerProductsPage";
import SellerOrdersPage from "@/pages/seller/SellerOrdersPage";
import SellerEarningsPage from "@/pages/seller/SellerEarningsPage";

const queryClient = new QueryClient();


const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) => {
  const { user, loading, isAuthenticated } = useAuth();


  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#fcfcfc] gap-4">
        <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="font-black text-[10px] uppercase tracking-[0.4em] text-slate-400">
          WEBMART SYSTEM INITIALIZING...
        </p>
      </div>
    );
  }


  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }


  if (allowedRoles) {
    const userRole = user.role?.toUpperCase() || "";
    

    const hasAccess = allowedRoles.some(allowedRole => 
      userRole === allowedRole.toUpperCase() || 
      userRole === `ROLE_${allowedRole.toUpperCase()}`
    );

    if (!hasAccess) {

      console.warn("Security Breach: Access Denied for role", userRole);

      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
};


const PublicLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="flex min-h-screen flex-col">
    <Navbar />
    <CartSidebar />
    <main className="flex-1 bg-[#fcfcfc]">{children}</main>
    <Footer />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartProvider>
        <TooltipProvider>
          <Toaster 
            position="top-right" 
            toastOptions={{ 
              duration: 3000,
              style: { 
                fontFamily: 'DM Sans, sans-serif', 
                borderRadius: '16px',
                background: '#1e293b',
                color: '#fff',
                fontSize: '12px',
                fontWeight: 'bold',
                padding: '12px 20px'
              } 
            }} 
          />
          <BrowserRouter>
            <Routes>
              {/* --- 🌍 PUBLIC ROUTES --- */}
              <Route path="/" element={<PublicLayout><HomePage /></PublicLayout>} />
              <Route path="/product/:id" element={<PublicLayout><ProductDetailPage /></PublicLayout>} />
              <Route path="/login" element={<PublicLayout><LoginPage /></PublicLayout>} />
              <Route path="/register" element={<PublicLayout><RegisterPage /></PublicLayout>} />
              <Route path="/verify-otp" element={<PublicLayout><OTPVerificationPage /></PublicLayout>} />
              <Route path="/forgot-password" element={<PublicLayout><ForgotPasswordPage /></PublicLayout>} />
              
              {/* --- 🛒 PROTECTED BUYER ROUTES --- */}
              <Route path="/checkout" element={<ProtectedRoute><PublicLayout><CheckoutPage /></PublicLayout></ProtectedRoute>} />
              <Route path="/orders" element={<ProtectedRoute><PublicLayout><OrderHistoryPage /></PublicLayout></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><PublicLayout><BuyerDashboard /></PublicLayout></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><PublicLayout><ProfilePage /></PublicLayout></ProtectedRoute>} />

              {/* --- 👑 ADMIN PANEL --- */}
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'DEVELOPER']}>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<AdminDashboardPage />} />
                <Route path="products" element={<AdminProductsPage />} />
                <Route path="orders" element={<AdminOrdersPage />} />
                <Route path="users" element={<AdminUsersPage />} />
              </Route>

              {/* --- 📦 SELLER PANEL --- */}
              <Route 
                path="/seller" 
                element={
                  <ProtectedRoute allowedRoles={['SELLER', 'ADMIN', 'DEVELOPER']}>
                    <SellerLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<SellerProductsPage />} />
                <Route path="products" element={<SellerProductsPage />} />
                <Route path="orders" element={<SellerOrdersPage />} />
                <Route path="earnings" element={<SellerEarningsPage />} />
              </Route>

              {/* --- 🚨 404 NOT FOUND --- */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;