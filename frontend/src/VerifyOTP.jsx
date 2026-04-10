import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Loader2, ArrowLeft, RefreshCcw } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function VerifyOTP() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(300); // 5 minutes
  const inputs = useRef([]);

  useEffect(() => {
    const countdown = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(countdown);
  }, []);

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return false;

    setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);

    if (element.nextSibling && element.value !== '') {
      element.nextSibling.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1].focus();
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      toast.error('Lütfen 6 haneli kodu eksiksiz girin.');
      return;
    }

    if (!email) {
      toast.error('Giriş bilgileri eksik, lütfen tekrar kayıt olun veya giriş yapın.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/v1/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: otpCode }),
      });

      const data = await response.json();
      if (response.ok) {
        toast.success('Hesabınız başarıyla doğrulandı!');
        setTimeout(() => navigate('/auth/login'), 1500);
      } else {
        toast.error(data.detail || 'Doğrulama başarısız.');
      }
    } catch (error) {
      toast.error('Sunucu hatası.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (timer > 240) {
      toast.error('Lütfen tekrar göndermek için biraz bekleyin.');
      return;
    }
    // Mock resend logic - would call backend normally
    toast.success('Yeni kod e-posta adresinize gönderildi (Mock)');
    setTimer(300);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="space-y-6 text-center"
    >
      <div className="flex flex-col items-center gap-4 mb-2">
        <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center text-accent">
          <ShieldCheck size={32} />
        </div>
        <div>
          <h2 className="text-3xl font-black text-primary tracking-tighter">Doğrulama Gerekli</h2>
          <p className="text-slate-500 font-medium text-sm mt-1">
            {email ? <span className="text-primary font-bold">{email}</span> : "E-posta"} adresine gönderilen 6 haneli kodu girin.
          </p>
        </div>
      </div>

      <form onSubmit={handleVerify} className="space-y-8">
        <div className="flex justify-center gap-2">
          {otp.map((data, index) => (
            <input
              key={index}
              ref={(el) => (inputs.current[index] = el)}
              type="text"
              maxLength="1"
              value={data}
              onChange={(e) => handleChange(e.target, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className="w-12 h-14 bg-slate-50 border-2 border-slate-200 rounded-xl text-center text-xl font-black text-primary focus:border-accent focus:ring-4 focus:ring-accent/10 focus:outline-none transition-all"
            />
          ))}
        </div>

        <div className="space-y-4">
          <button
            type="submit"
            disabled={loading || timer === 0}
            className="w-full bg-primary text-white font-black py-4 rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" /> : 'Kodu Doğrula'}
          </button>

          <div className="flex flex-col items-center gap-2">
            <p className="text-sm font-bold text-slate-400">
              Kalan Süre: <span className={timer < 60 ? 'text-red-500' : 'text-primary'}>{formatTime(timer)}</span>
            </p>
            <button
              type="button"
              onClick={handleResend}
              className="flex items-center gap-2 text-sm font-bold text-accent hover:underline decoration-2"
            >
              <RefreshCcw size={14} /> Kodu Tekrar Gönder
            </button>
          </div>
        </div>
      </form>

      <button
        onClick={() => navigate('/auth/login')}
        className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-primary transition-colors mx-auto"
      >
        <ArrowLeft size={16} /> Giriş Ekranına Dön
      </button>
    </motion.div>
  );
}
