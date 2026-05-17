import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Eye, EyeOff } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ 
    fullName: '', 
    username: '', 
    email: '', 
    password: '', 
    role: 'BUYER', 
    companyName: '' 
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form };

      if (!payload.username.trim()) {
        delete (payload as any).username;
      }

      if (form.role === 'BUYER') {
        delete (payload as any).companyName;
      }

      await api.post('/auth/register', payload);
      toast.success('Registration successful! Check your email for OTP.');

      navigate(`/verify-otp?email=${encodeURIComponent(form.email)}`);
    } catch (error: any) {
      const errorMsg = error.response?.data || "";
      const isAlreadyUsed = typeof errorMsg === 'string' && errorMsg.toLowerCase().includes("already use");

      if (isAlreadyUsed) {

        toast((t) => (
          <span className="text-xs font-medium">
            Email already exists. Need to verify? 
            <button 
              onClick={() => {
                toast.dismiss(t.id);
                navigate(`/verify-otp?email=${encodeURIComponent(form.email)}`);
              }}
              className="ml-2 font-black text-primary underline uppercase"
            >
              Verify Now
            </button>
          </span>
        ), { duration: 5000 });
      } else {
        toast.error(errorMsg || "Registration failed!");
      }
      console.log("Error Status:", error.response?.status);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6 rounded-xl border bg-card p-8 shadow-elevated">
        <div className="text-center">
          <h1 className="font-heading text-2xl font-bold">Create Account</h1>
          <p className="mt-1 text-sm text-muted-foreground">Join WebMart community today</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Full Name</label>
            <input 
              value={form.fullName} 
              onChange={(e) => setForm({ ...form, fullName: e.target.value.replace(/[^a-zA-Z\s]/g, '') })} 
              placeholder="Enter your full name" 
              className="mt-1 w-full rounded-lg border px-4 py-2.5 text-sm outline-none ring-ring focus:ring-2 bg-background" 
              required 
            />
          </div>

          <div>
            <label className="text-sm font-medium">Username (Optional)</label>
            <input 
              value={form.username} 
              onChange={(e) => setForm({ ...form, username: e.target.value.replace(/[^a-z0-9_]/g, '') })} 
              placeholder="Auto-generated if empty" 
              className="mt-1 w-full rounded-lg border px-4 py-2.5 text-sm outline-none ring-ring focus:ring-2 bg-background" 
            />
          </div>

          <div>
             <label className="text-sm font-medium">Email</label>
             <input 
               type="email" 
               value={form.email} 
               onChange={(e) => setForm({ ...form, email: e.target.value })} 
               placeholder="Enter your email" 
               className="mt-1 w-full rounded-lg border px-4 py-2.5 text-sm outline-none ring-ring focus:ring-2 bg-background" 
               required 
             />
          </div>

          <div>
             <label className="text-sm font-medium">Password</label>
             <input 
               type={showPassword ? 'text' : 'password'} 
               value={form.password} 
               onChange={(e) => setForm({ ...form, password: e.target.value })} 
               placeholder="Enter your password" 
               className="mt-1 w-full rounded-lg border px-4 py-2.5 text-sm outline-none ring-ring focus:ring-2 bg-background" 
               required 
               minLength={6} 
             />
          </div>

          <div>
            <label className="text-sm font-medium">Register as</label>
            <select 
              value={form.role} 
              onChange={(e) => setForm({ ...form, role: e.target.value })} 
              className="mt-1 w-full rounded-lg border px-4 py-2.5 text-sm outline-none ring-ring focus:ring-2 bg-background"
            >
              <option value="BUYER">BUYER</option>
              <option value="SELLER">SELLER</option>
            </select>
          </div>

          {form.role === 'SELLER' && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-200">
              <label className="text-sm font-medium">Company Name</label>
              <input 
                value={form.companyName} 
                onChange={(e) => setForm({ ...form, companyName: e.target.value })} 
                placeholder="Business Name" 
                className="mt-1 w-full rounded-lg border border-primary/50 px-4 py-2.5 text-sm outline-none ring-ring focus:ring-2 bg-background" 
                required={form.role === 'SELLER'} 
              />
            </div>
          )}
          
          <button 
            type="submit" 
            disabled={loading} 
            className="w-full rounded-lg bg-primary py-2.5 text-white font-medium hover:opacity-90 transition-all active:scale-[0.98] shadow-lg shadow-primary/20"
          >
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account? <Link to="/login" className="font-medium text-primary hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;