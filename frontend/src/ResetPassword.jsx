import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lock, Loader2, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Şifreler eşleşmiyor!');
      return;
    }
    if (password.length < 8) {
      toast.error('Şifre en az 8 karakter olmalıdır.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/v1/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, new_password: password }),
      });

      const data = await response.json();
      if (response.ok) {
        toast.success('Şifreniz başarıyla güncellendi!');
        setTimeout(() => navigate('/auth/login'), 2000);
      } else {
        toast.error(data.detail || 'Sıfırlama işlemi başarısız.');
      }
    } catch (error) {
      toast.error('Sunucu hatası.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center space-y-4">
        <AlertCircle size={48} className="mx-auto text-red-500" />
        <h2 className="text-2xl font-black text-primary">Geçersiz Bağlantı</h2>
        <p className="text-slate-500 font-medium whitespace-pre-line">
          Şifre sıfırlama bağlantısı geçersiz veya süresi dolmuş.{"\n"}Lütfen tekrar şifre sıfırlama talebinde bulunun.
        </p>
        <button onClick={() => navigate('/auth/login')} className="text-accent font-bold hover:underline">Giriş Ekranına Dön</button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-4xl font-black text-primary tracking-tighter">Şifreni Sıfırla</h2>
        <p className="text-slate-500 font-medium mt-2">Lütfen yeni ve güvenli bir şifre belirleyin.</p>
      </div>

      <form onSubmit={handleReset} className="space-y-5">
        <div className="space-y-2">
          <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest ml-1">Yeni Şifre</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-accent transition-colors">
              <Lock size={18} />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-11 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-primary focus:border-accent focus:ring-4 focus:ring-accent/10 focus:outline-none transition-all"
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-accent transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest ml-1">Yeni Şifre (Tekrar)</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-accent transition-colors">
              <Lock size={18} />
            </div>
            <input
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full pl-11 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-primary focus:border-accent focus:ring-4 focus:ring-accent/10 focus:outline-none transition-all"
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-accent transition-colors"
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-white font-black py-4 rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="animate-spin" /> : 'Şifreyi Güncelle'}
        </button>
      </form>
    </motion.div>
  );
}
