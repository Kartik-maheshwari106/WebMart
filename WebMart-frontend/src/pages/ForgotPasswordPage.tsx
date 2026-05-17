import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { KeyRound, ArrowLeft, Mail } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const ForgotPasswordPage = () => {
  const [step, setStep] = useState<'email' | 'otp' | 'reset'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [passwords, setPasswords] = useState({ password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);  

  const startTimer = () => {
    setTimer(120);
    const interval = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) { clearInterval(interval); return 0; }
        return t - 1;
      });
    }, 1000);
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forget-password', { email });
      toast.success('OTP sent to your email!');
      setStep('otp');
      startTimer();
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const handleOTPChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      document.getElementById(`fp-otp-${index + 1}`)?.focus();
    }
  };

  const handleOTPKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`fp-otp-${index - 1}`)?.focus();
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length !== 6) { toast.error('Enter complete OTP'); return; }
    setLoading(true);
    try {
      await api.post('/auth/verify-otp', { email, otp: code,purpose: 'forgot_password' });
      toast.success('OTP verified!');
      setStep('reset');
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalOtp = otp.join('');
    if (passwords.password !== passwords.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (passwords.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { email, otp: finalOtp, newPassword: passwords.password });
      toast.success('Password updated! Redirecting to login...');
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const resendOTP = async () => {
    try {
      await api.post('/auth/forgot-password', { email });
      startTimer();
      toast.success('OTP resent!');
    } catch {}
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-md animate-fade-in space-y-6 rounded-xl border bg-card p-8 shadow-elevated">
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full gradient-hero">
            <KeyRound className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="font-heading text-2xl font-bold">
            {step === 'email' && 'Forgot Password'}
            {step === 'otp' && 'Verify OTP'}
            {step === 'reset' && 'Reset Password'}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {step === 'email' && 'Enter your email to receive a reset code'}
            {step === 'otp' && `Enter the 6-digit code sent to ${email}`}
            {step === 'reset' && 'Set your new password'}
          </p>
        </div>

        {step === 'email' && (
          <form onSubmit={handleSendOTP} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full rounded-lg border bg-background py-2.5 pl-10 pr-4 text-sm outline-none ring-ring focus:ring-2" required placeholder="your@email.com" />
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full rounded-lg bg-primary py-2.5 font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-opacity">
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
          </form>
        )}

        {step === 'otp' && (
          <form onSubmit={handleVerifyOTP} className="space-y-6">
            <div className="flex justify-center gap-2">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  id={`fp-otp-${i}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOTPChange(i, e.target.value.replace(/\D/g, ''))}
                  onKeyDown={(e) => handleOTPKeyDown(i, e)}
                  className="h-12 w-12 rounded-lg border bg-background text-center text-lg font-bold outline-none ring-ring focus:ring-2"
                />
              ))}
            </div>
            <div className="text-center text-sm text-muted-foreground">
              {timer > 0 ? (
                <span>Resend in <span className="font-medium text-foreground">{formatTime(timer)}</span></span>
              ) : (
                <button type="button" onClick={resendOTP} className="font-medium text-primary hover:underline">Resend OTP</button>
              )}
            </div>
            <button type="submit" disabled={loading} className="w-full rounded-lg bg-primary py-2.5 font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50">
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
          </form>
        )}

        {step === 'reset' && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="text-sm font-medium">New Password</label>
              <input type="password" value={passwords.password} onChange={(e) => setPasswords({ ...passwords, password: e.target.value })} className="mt-1 w-full rounded-lg border bg-background px-4 py-2.5 text-sm outline-none ring-ring focus:ring-2" required minLength={6} />
            </div>
            <div>
              <label className="text-sm font-medium">Confirm Password</label>
              <input type="password" value={passwords.confirmPassword} onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })} className="mt-1 w-full rounded-lg border bg-background px-4 py-2.5 text-sm outline-none ring-ring focus:ring-2" required minLength={6} />
            </div>
            <button type="submit" disabled={loading} className="w-full rounded-lg bg-primary py-2.5 font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50">
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}

        <p className="text-center text-sm text-muted-foreground">
          <Link to="/login" className="inline-flex items-center gap-1 font-medium text-primary hover:underline">
            <ArrowLeft className="h-3 w-3" /> Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
