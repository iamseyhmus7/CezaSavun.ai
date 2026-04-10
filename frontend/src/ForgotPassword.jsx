import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, Loader2, ArrowLeft, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Lütfen e-posta adresinizi girin.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/v1/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        toast.success('Sıfırlama e-postası gönderildi!');
        setIsSent(true);
      } else {
        toast.error('Talep gönderilemedi.');
      }
    } catch (error) {
      toast.error('Sunucu hatası.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-4xl font-black text-primary tracking-tighter">Şifremi Unuttum</h2>
        <p className="text-slate-500 font-medium mt-2">
          E-posta adresinizi girin, size şifre sıfırlama bağlantısı gönderelim.
        </p>
      </div>

      {!isSent ? (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest ml-1">E-Posta Adresi</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-accent transition-colors">
                <Mail size={18} />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-primary focus:border-accent focus:ring-4 focus:ring-accent/10 focus:outline-none transition-all"
                placeholder="örnek@eposta.com"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white font-black py-4 rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : <>E-posta Gönder <Send size={18} /></>}
          </button>
        </form>
      ) : (
        <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-3xl space-y-3">
          <p className="text-emerald-700 font-bold text-sm">
            Talimatlar e-posta adresinize gönderildi. Lütfen gelen kutusunu (ve gereksiz kutusunu) kontrol edin.
          </p>
          <button
            onClick={() => navigate('/auth/login')}
            className="w-full py-3 bg-emerald-500 text-white font-black rounded-2xl hover:bg-emerald-600 transition-colors"
          >
            Giriş Ekranına Dön
          </button>
        </div>
      )}

      <button
        onClick={() => navigate('/auth/login')}
        className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-primary transition-colors mx-auto"
      >
        <ArrowLeft size={16} /> Geri Dön
      </button>
    </motion.div>
  );
}
