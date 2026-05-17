import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { KeyRound } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const OTPVerificationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();


  const [email, setEmail] = useState<string>(() => {

    const params = new URLSearchParams(location.search);
    const urlEmail = params.get('email');
    

    const stateEmail = (location.state as any)?.email;
    

    const localEmail = localStorage.getItem('pendingEmail');

    const finalEmail = urlEmail || stateEmail || localEmail || '';
    

    if (finalEmail) localStorage.setItem('pendingEmail', finalEmail);
    return finalEmail;
  });

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(120);
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    if (!email) {
      const timeout = setTimeout(() => {
        toast.error("Session expired. Please register again.");
        navigate('/register');
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [email, navigate]);

  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length !== 6) { toast.error('Enter complete OTP'); return; }
    
    if (!email) { toast.error("Email missing!"); return; }

    setLoading(true);
    try {

      await api.post('/auth/verify-otp', { 
        email: email.trim(), 
        otp: code 
      });

      toast.success('Email verified! Please login.');
      localStorage.removeItem('pendingEmail'); // Success ke baad delete
      navigate('/login');
    } catch (error: any) {
      const errorData = error.response?.data;
      const Message = typeof errorData === 'string' 
        ? errorData 
        : errorData?.message || 'Verification failed. Please try again.';
      
      toast.error(Message);
    } finally {
      setLoading(false);
    }
  };

  const resendOTP = async () => {
    try {
      await api.post('/auth/resend-otp', { email: email.trim() });
      setTimer(120);
      toast.success('OTP resent!');
    } catch (error: any) {
      toast.error('Failed to resend OTP.');
    }
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-md animate-fade-in space-y-6 rounded-xl border bg-card p-8 shadow-elevated text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <KeyRound className="h-6 w-6 text-primary" />
        </div>
        <h1 className="text-2xl font-bold">Verify Email</h1>
        <p className="text-sm text-muted-foreground">
          Enter the code sent to <br />
          <span className="font-medium text-foreground">{email}</span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-center gap-2">
            {otp.map((digit, i) => (
              <input
                key={i}
                id={`otp-${i}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value.replace(/\D/g, ''))}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className="h-12 w-12 rounded-lg border bg-background text-center text-lg font-bold outline-none focus:ring-2 focus:ring-primary"
              />
            ))}
          </div>

          <div className="text-sm text-muted-foreground">
            {timer > 0 ? (
              <span>Resend in <span className="font-medium text-foreground">{formatTime(timer)}</span></span>
            ) : (
              <button type="button" onClick={resendOTP} className="font-medium text-primary hover:underline">Resend OTP</button>
            )}
          </div>

          <button type="submit" disabled={loading} className="w-full rounded-lg bg-primary py-2.5 font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50">
            {loading ? 'Verifying...' : 'Verify'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default OTPVerificationPage;