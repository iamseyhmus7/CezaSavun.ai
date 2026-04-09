import React, { useState } from 'react';
import { User, Mail, Lock, Phone, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function Register({ setAuthView, onRegisterSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const triggerError = () => {
    setIsError(true);
    setTimeout(() => setIsError(false), 500);
  };

  const validatePassword = (pass) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return regex.test(pass);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, surname, email, phone, password, confirmPassword } = formData;

    if (!name || !surname || !email || !phone || !password || !confirmPassword) {
      toast.error('Lütfen tüm alanları doldurun!');
      triggerError();
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Şifreler eşleşmiyor!');
      triggerError();
      return;
    }

    if (!validatePassword(password)) {
      toast.error('Şifre en az 8 karakter, 1 büyük harf ve 1 rakam içermelidir!');
      triggerError();
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Hesabınız başarıyla oluşturuldu!');
        setIsSuccess(true);
        setTimeout(onRegisterSuccess, 1000);
      } else {
        toast.error(data.detail || 'Kayıt başarısız!');
        triggerError();
      }
    } catch (error) {
      toast.error('Sunucu bağlantı hatası!');
      triggerError();
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field) => `w-full pl-11 pr-4 py-3.5 bg-slate-50 border rounded-2xl text-sm font-bold text-primary focus:outline-none transition-all placeholder:text-slate-300 ring-offset-0
    ${isError ? 'border-red-500 ring-4 ring-red-500/10' : isSuccess ? 'border-emerald-500 ring-4 ring-emerald-500/10' : 'border-slate-200 focus:border-accent focus:ring-4 focus:ring-accent/10'}`;

  return (
    <motion.div 
      animate={isError ? { x: [-10, 10, -10, 10, 0] } : {}}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div className="mb-6">
        <h2 className="text-4xl font-black text-primary tracking-tighter">Hesap Oluştur</h2>
        <p className="text-slate-500 font-medium mt-2">Adalete açılan teknolojik kapıya katılın.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest ml-1">Ad</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-accent transition-colors"><User size={16} /></div>
              <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className={inputClass('name')} placeholder="Ali" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest ml-1">Soyad</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-accent transition-colors"><User size={16} /></div>
              <input type="text" value={formData.surname} onChange={(e) => setFormData({...formData, surname: e.target.value})} className={inputClass('surname')} placeholder="Yılmaz" />
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest ml-1">E-Posta</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-accent transition-colors"><Mail size={16} /></div>
            <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className={inputClass('email')} placeholder="ali@örnek.com" />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest ml-1">Telefon</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-accent transition-colors"><Phone size={16} /></div>
            <input type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className={inputClass('phone')} placeholder="0500 000 00 00" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest ml-1">Şifre</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-accent transition-colors"><Lock size={16} /></div>
              <input type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className={inputClass('password')} placeholder="••••••••" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest ml-1">Tekrar</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-accent transition-colors"><Lock size={16} /></div>
              <input type="password" value={formData.confirmPassword} onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})} className={inputClass('confirmPassword')} placeholder="••••••••" />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || isSuccess}
          className={`w-full font-black py-4 rounded-2xl flex items-center justify-center gap-2 shadow-xl transition-all transform active:scale-[0.98] disabled:opacity-70 mt-4
            ${isSuccess ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-accent text-white shadow-accent/20 hover:scale-[1.01]'}`}
        >
          {loading ? <Loader2 className="animate-spin" /> : isSuccess ? <CheckCircle2 className="animate-bounce" /> : <>Kayıt İşlemini Tamamla <ArrowRight size={18} /></>}
        </button>
      </form>

      <p className="text-center text-sm font-bold text-slate-500 border-t border-slate-50 pt-6">
        Zaten bir hesabın var mı?{' '}
        <button onClick={setAuthView} className="text-primary hover:underline decoration-2">Giriş Yap</button>
      </p>
    </motion.div>
  );
}
