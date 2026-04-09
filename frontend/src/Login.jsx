import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { useGoogleLogin } from '@react-oauth/google';

export default function Login({ setAuthView, onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const triggerError = () => {
    setIsError(true);
    setTimeout(() => setIsError(false), 500);
  };

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      toast.loading('Google doğrulanıyor...');
      try {
        // credential/token verisini backend'e gönder
        const response = await fetch('/api/v1/auth/google', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: tokenResponse.access_token }),
        });

        const data = await response.json();
        
        if (response.ok) {
          localStorage.setItem('token', data.access_token);
          toast.dismiss();
          toast.success('Google ile başarıyla giriş yapıldı!');
          setIsSuccess(true);
          setTimeout(onLoginSuccess, 1000);
        } else {
          toast.dismiss();
          toast.error(data.detail || 'Google girişi başarısız!');
          triggerError();
        }
      } catch (error) {
        toast.dismiss();
        toast.error('Sunucu bağlantı hatası!');
        triggerError();
      }
    },
    onError: () => {
      toast.error('Google girişi iptal edildi veya hata oluştu.');
      triggerError();
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Lütfen tüm alanları doldurun!');
      triggerError();
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.access_token);
        toast.success('Başarıyla giriş yapıldı!');
        setIsSuccess(true);
        setTimeout(onLoginSuccess, 800);
      } else {
        toast.error(data.detail || 'Giriş başarısız!');
        triggerError();
      }
    } catch (error) {
      toast.error('Sunucu bağlantı hatası!');
      triggerError();
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      animate={isError ? { x: [-10, 10, -10, 10, 0] } : {}}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div className="mb-8">
        <h2 className="text-4xl font-black text-primary tracking-tighter">Oturum Aç</h2>
        <p className="text-slate-500 font-medium mt-2">Hukuki süreçlerinizi yönetmeye devam edin.</p>
      </div>

      <button
        onClick={handleGoogleLogin}
        type="button"
        className="w-full flex items-center justify-center gap-3 px-4 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-all font-bold text-slate-700 active:scale-[0.98]"
      >
        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
        Google ile Giriş Yap
      </button>

      <div className="relative flex items-center gap-4 text-slate-300 text-[10px] font-black tracking-widest uppercase">
        <div className="flex-1 h-px bg-slate-100" />
        VEYA EPOSTA
        <div className="flex-1 h-px bg-slate-100" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest ml-1">E-Posta Adresi</label>
          <div className="relative group">
            <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors ${isError ? 'text-red-500' : isSuccess ? 'text-emerald-500' : 'text-slate-400 group-focus-within:text-accent'}`}>
              <Mail size={18} />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full pl-11 pr-4 py-4 bg-slate-50 border rounded-2xl text-sm font-bold text-primary focus:outline-none transition-all placeholder:text-slate-300 ring-offset-0
                ${isError ? 'border-red-500 ring-4 ring-red-500/10' : isSuccess ? 'border-emerald-500 ring-4 ring-emerald-500/10' : 'border-slate-200 focus:border-accent focus:ring-4 focus:ring-accent/10'}`}
              placeholder="örnek@eposta.com"
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between ml-1">
            <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">Şifre</label>
            <button type="button" className="text-[11px] font-bold text-accent hover:underline decoration-2">Şifremi Unuttum</button>
          </div>
          <div className="relative group">
            <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors ${isError ? 'text-red-500' : isSuccess ? 'text-emerald-500' : 'text-slate-400 group-focus-within:text-accent'}`}>
              <Lock size={18} />
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full pl-11 pr-4 py-4 bg-slate-50 border rounded-2xl text-sm font-bold text-primary focus:outline-none transition-all placeholder:text-slate-300 ring-offset-0
                ${isError ? 'border-red-500 ring-4 ring-red-500/10' : isSuccess ? 'border-emerald-500 ring-4 ring-emerald-500/10' : 'border-slate-200 focus:border-accent focus:ring-4 focus:ring-accent/10'}`}
              placeholder="••••••••"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || isSuccess}
          className={`w-full font-black py-4 rounded-2xl flex items-center justify-center gap-2 shadow-xl transition-all transform active:scale-[0.98] disabled:opacity-70
            ${isSuccess ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-primary text-white shadow-primary/20 hover:scale-[1.01]'}`}
        >
          {loading ? <Loader2 className="animate-spin" /> : isSuccess ? <CheckCircle2 className="animate-bounce" /> : <>Giriş Yap <ArrowRight size={18} /></>}
        </button>
      </form>

      <p className="text-center text-sm font-bold text-slate-500 border-t border-slate-50 pt-8">
        Henüz hesabın yok mu?{' '}
        <button onClick={setAuthView} className="text-accent hover:underline decoration-2">Ücretsiz Kayıt Ol</button>
      </p>
    </motion.div>
  );
}
