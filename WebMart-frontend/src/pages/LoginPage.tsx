import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const loginToast = toast.loading("Authenticating with WebMart...");

    try {
      const res = await api.post('/auth/login', form);
      
      const token = res.data.token;
      const user = res.data.user || res.data;

      if (token) {
        login(token, user); 
        
        toast.success(`Access Granted. Welcome, ${user.fullName || 'User'}!`, { id: loginToast });
        
        const userRole = (user.role || '').toUpperCase();

        if (userRole.includes('ADMIN') || userRole.includes('DEVELOPER')) {
          navigate('/admin');
        } else if (userRole.includes('SELLER')) {
          navigate('/seller');
        } else {
          navigate('/');
        }
      } else {
        throw new Error("Invalid response from server (Missing Token)");
      }

    } catch (error: any) {
      const status = error.response?.status;
      const errorData = error.response?.data;
      const errorMsg = typeof errorData === 'string' ? errorData.toLowerCase() : "";
      

      const isBlocked = status === 403 && (errorMsg.includes("denied") || errorMsg.includes("suspended") || errorMsg.includes("blocked"));
      

      const isNotVerified = !isBlocked && (status === 410 || status === 403 || errorMsg.includes("verify"));

      if (isBlocked) {

        toast.error(errorData || "Access Denied! Account Suspended.", { id: loginToast, duration: 4000 });
      } else if (isNotVerified) {

        toast.error("Account identity not verified. Redirecting to OTP...", { id: loginToast });
        setTimeout(() => {
          navigate(`/verify-otp?email=${encodeURIComponent(form.email)}`);
        }, 1500);
      } else {

        const msg = typeof errorData === 'string' ? errorData : "Authentication Failed!";
        toast.error(msg, { id: loginToast });
      }
      
      console.error("Login Error:", status, errorData);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[85vh] items-center justify-center px-4 bg-slate-50/30">
      <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-500 space-y-8 rounded-[2rem] border border-slate-200 bg-white p-10 shadow-2xl shadow-slate-200/60">
        
        <div className="text-center space-y-2">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900 shadow-lg rotate-3 hover:rotate-0 transition-transform duration-300">
            <LogIn className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-black tracking-tighter text-slate-900 uppercase italic">WebMart Login</h1>
          <p className="text-xs font-bold text-slate-400 tracking-widest uppercase">Secure Access Terminal</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Email Address</label>
            <input 
              type="email" 
              placeholder="name@example.com"
              value={form.email} 
              onChange={(e) => setForm({ ...form, email: e.target.value })} 
              className="w-full rounded-2xl border-none bg-slate-100 px-5 py-4 text-sm font-bold outline-none ring-primary/20 focus:ring-2 transition-all text-slate-700" 
              required 
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Password</label>
            <div className="relative">
              <input 
                type={showPassword ? 'text' : 'password'} 
                placeholder="••••••••"
                value={form.password} 
                onChange={(e) => setForm({ ...form, password: e.target.value })} 
                className="w-full rounded-2xl border-none bg-slate-100 px-5 py-4 pr-12 text-sm font-bold outline-none ring-primary/20 focus:ring-2 transition-all text-slate-700" 
                required 
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)} 
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            <div className="flex justify-end pr-1">
              <Link 
                to="/forgot-password" 
                className="text-[10px] font-black text-primary uppercase tracking-tighter hover:underline"
              >
                Forgot Password/Email?
              </Link>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="group relative w-full overflow-hidden rounded-2xl bg-slate-900 py-4 font-black text-xs uppercase tracking-[0.2em] text-white shadow-xl transition-all active:scale-[0.98] disabled:opacity-70"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              ) : (
                'Log In'
              )}
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        </form>

        <div className="pt-4 text-center">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-tight">
            New to the platform?{' '}
            <Link to="/register" className="text-primary hover:text-primary/80 font-black underline-offset-4 underline">
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;