import React, { useState, useEffect } from 'react';
import { CreditCard, Smartphone, X, Loader2, CheckCircle2, ShieldCheck, Banknote } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  onSuccess: (paymentDetails: any) => void;
}

const PaymentModal = ({ isOpen, onClose, amount, onSuccess }: PaymentModalProps) => {
  const [step, setStep] = useState<'selection' | 'processing' | 'success'>('selection');

  useEffect(() => {
    if (isOpen) setStep('selection');
  }, [isOpen]);

  const handleFakePayment = () => {
    setStep('processing');
    
    setTimeout(() => {
      setStep('success');
      
      setTimeout(() => {
        const mockResponse = {
          razorpay_payment_id: "pay_mock_" + Math.random().toString(36).substring(7),
          status: 'captured',
          method: 'UPI/Card'
        };
        onSuccess(mockResponse);
        onClose();
      }, 2000);
    }, 3500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
      {/* Container: Added max-height and flex-col to prevent overflow */}
      <div className="relative w-full max-w-[420px] max-h-[90vh] overflow-hidden rounded-[2.5rem] bg-white shadow-2xl flex flex-col scale-in-center">
        
        {/* Header: Fixed at top */}
        <div className="bg-slate-50 px-6 py-5 flex items-center justify-between border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 leading-none">Secured by</p>
              <h3 className="text-lg font-black text-slate-800 tracking-tight">WebMart <span className="text-primary">Pay</span></h3>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="rounded-full p-2 hover:bg-slate-200 transition-all text-slate-400 hover:text-slate-600 active:scale-90"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body: Scrollable if content is long */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          {step === 'selection' && (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
              {/* Amount Display */}
              <div className="bg-primary/5 rounded-[2rem] p-5 flex justify-between items-center border border-primary/10">
                <span className="text-xs font-bold text-slate-500">Total Amount</span>
                <span className="text-2xl font-black text-primary italic">₹{amount.toLocaleString()}</span>
              </div>

              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 text-center">Select Payment Method</p>

              <div className="grid gap-3">
                {/* Method 1: Card */}
                <button onClick={handleFakePayment} className="group w-full flex items-center justify-between p-4 border-2 border-slate-100 rounded-[1.5rem] hover:border-primary/40 hover:bg-primary/5 transition-all active:scale-95">
                  <div className="flex items-center gap-4 text-left">
                    <div className="h-11 w-11 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <CreditCard className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-black text-sm text-slate-800">Card Payment</p>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">Visa, MasterCard, RuPay</p>
                    </div>
                  </div>
                  <div className="h-1.5 w-1.5 rounded-full bg-slate-200 group-hover:bg-primary transition-colors" />
                </button>

                {/* Method 2: UPI */}
                <button onClick={handleFakePayment} className="group w-full flex items-center justify-between p-4 border-2 border-slate-100 rounded-[1.5rem] hover:border-primary/40 hover:bg-primary/5 transition-all active:scale-95">
                  <div className="flex items-center gap-4 text-left">
                    <div className="h-11 w-11 bg-green-50 rounded-xl flex items-center justify-center text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors">
                      <Smartphone className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-black text-sm text-slate-800">UPI (GPay / PhonePe)</p>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">Instant & Secure Transfer</p>
                    </div>
                  </div>
                  <div className="h-1.5 w-1.5 rounded-full bg-slate-200 group-hover:bg-primary transition-colors" />
                </button>

                {/* Method 3: Net Banking */}
                <button onClick={handleFakePayment} className="group w-full flex items-center justify-between p-4 border-2 border-slate-100 rounded-[1.5rem] hover:border-primary/40 hover:bg-primary/5 transition-all active:scale-95">
                  <div className="flex items-center gap-4 text-left">
                    <div className="h-11 w-11 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                      <Banknote className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-black text-sm text-slate-800">Net Banking</p>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">All Indian Banks</p>
                    </div>
                  </div>
                  <div className="h-1.5 w-1.5 rounded-full bg-slate-200 group-hover:bg-primary transition-colors" />
                </button>
              </div>
            </div>
          )}

          {step === 'processing' && (
            <div className="py-12 text-center space-y-6 animate-in zoom-in-95">
              <div className="relative h-20 w-20 mx-auto">
                <Loader2 className="h-20 w-20 text-primary animate-spin stroke-[3px]" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <ShieldCheck className="h-7 w-7 text-primary/30" />
                </div>
              </div>
              <div>
                <h4 className="font-black text-xl text-slate-800 italic tracking-tight">Processing...</h4>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-2">Do not refresh or go back</p>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="py-12 text-center space-y-6 animate-in fade-in scale-100 duration-500">
              <div className="h-24 w-24 bg-green-100 rounded-[2.5rem] flex items-center justify-center mx-auto text-green-600 border-4 border-white shadow-xl shadow-green-100/50">
                <CheckCircle2 className="h-14 w-14" />
              </div>
              <div>
                <h4 className="text-2xl font-black text-slate-800 italic tracking-tighter">Payment Verified!</h4>
                <p className="text-xs text-slate-500 font-bold mt-2 uppercase tracking-[0.1em]">Redirecting to your orders...</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer: Fixed at bottom */}
        <div className="bg-slate-50 px-6 py-4 text-center border-t border-slate-100 flex items-center justify-center gap-2 shrink-0">
          <ShieldCheck className="h-3.5 w-3.5 text-slate-400" />
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
            PCI-DSS COMPLIANT ENCRYPTION
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;