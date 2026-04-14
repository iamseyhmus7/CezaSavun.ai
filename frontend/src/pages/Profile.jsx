import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  User, Mail, Phone, Lock, Save, 
  ShieldCheck, CheckCircle2, AlertCircle,
  Loader2, Camera, Key
} from 'lucide-react';
import toast from 'react-hot-toast';
import { apiFetch } from '../utils/api';

export default function Profile() {
  const { currentUser, loadData } = useOutletContext();
  const [updating, setUpdating] = useState(false);
  const [user, setUser] = useState({
    name: '',
    surname: '',
    email: '',
    phone: '',
    is_verified: false
  });

  const [passwords, setPasswords] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  useEffect(() => {
    if (currentUser) {
      setUser(currentUser);
    }
  }, [currentUser]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const res = await apiFetch('/auth/me', {
        method: 'PATCH',
        body: JSON.stringify({
          name: user.name,
          surname: user.surname,
          phone: user.phone
        })
      });

      if (res.ok) {
        toast.success('Profil bilgileriniz güncellendi');
        loadData(); // Layout'taki datayı tazele
      } else {
        const err = await res.json();
        toast.error(err.detail || 'Güncelleme başarısız');
      }
    } catch (error) {
      toast.error('Bir hata oluştu');
    } finally {
      setUpdating(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwords.new_password !== passwords.confirm_password) {
      toast.error('Yeni şifreler eşleşmiyor');
      return;
    }

    setUpdating(true);
    try {
      const res = await apiFetch('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({
          current_password: passwords.current_password,
          new_password: passwords.new_password
        })
      });

      if (res.ok) {
        toast.success('Şifreniz başarıyla değiştirildi');
        setPasswords({ current_password: '', new_password: '', confirm_password: '' });
      } else {
        const err = await res.json();
        toast.error(err.detail || 'Şifre değiştirme başarısız');
      }
    } catch (error) {
      toast.error('Bir hata oluştu');
    } finally {
      setUpdating(false);
    }
  };

  if (!currentUser) return <div className="p-20 text-center text-slate-400 font-bold uppercase tracking-widest">Yükleniyor...</div>;

  return (
    <div className="p-8 pb-32">
      <div className="max-w-5xl mx-auto space-y-8">
        
        <header>
          <h2 className="text-3xl font-black text-primary tracking-tight">Hesap Ayarları</h2>
          <p className="text-slate-500 font-medium mt-1">Profilinizi ve güvenlik tercihlerinizi yönetin.</p>
        </header>

        <div className="grid md:grid-cols-3 gap-8">
          
          {/* Sidebar / Info */}
          <div className="space-y-6">
            <div className="glass-card rounded-[32px] p-8 text-center bg-white shadow-xl shadow-slate-200/50">
              <div className="relative inline-block mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-primary to-[#1e3a5f] rounded-[32px] flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-primary/20">
                  {user.name?.[0]}{user.surname?.[0]}
                </div>
                <button className="absolute -bottom-2 -right-2 p-2 bg-white border border-slate-100 rounded-xl shadow-lg text-slate-400 hover:text-accent transition-colors">
                  <Camera size={16} />
                </button>
              </div>
              <h2 className="text-lg font-black text-primary">{user.name} {user.surname}</h2>
              <p className="text-sm text-slate-400 font-bold mb-4">{user.email}</p>
              <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${user.is_verified ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                {user.is_verified ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                {user.is_verified ? 'Doğrulanmış Hesap' : 'Onay Bekliyor'}
              </div>
            </div>

            <div className="glass-card rounded-[32px] p-8 bg-slate-900 text-white shadow-2xl">
              <h3 className="font-extrabold text-[10px] uppercase tracking-widest text-slate-400 mb-6 border-b border-white/5 pb-4">Üyelik Bilgisi</h3>
              <div className="space-y-6">
                <div>
                  <p className="text-[10px] text-slate-500 font-black uppercase mb-1 tracking-widest">Katılım Tarihi</p>
                  <p className="text-sm font-bold">{user.created_at ? new Date(user.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 font-black uppercase mb-1 tracking-widest">Plan Türü</p>
                  <span className="text-xs font-black bg-white/10 px-3 py-1 rounded-lg">PRO ÜYE</span>
                </div>
              </div>
            </div>
          </div>

          {/* Form Area */}
          <div className="md:col-span-2 space-y-8">
            
            {/* Personal Info */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-[32px] overflow-hidden bg-white shadow-xl shadow-slate-200/50"
            >
              <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between">
                <h3 className="font-black text-primary text-sm tracking-widest uppercase">KİŞİSEL BİLGİLER</h3>
              </div>
              <form onSubmit={handleUpdateProfile} className="p-8 space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">AD</label>
                    <input 
                      type="text" 
                      value={user.name}
                      onChange={(e) => setUser({...user, name: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 px-5 text-sm font-bold text-primary focus:border-accent transition-all outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">SOYAD</label>
                    <input 
                      type="text" 
                      value={user.surname}
                      onChange={(e) => setUser({...user, surname: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 px-5 text-sm font-bold text-primary focus:border-accent transition-all outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">TELEFON NUMARASI</label>
                  <input 
                    type="tel" 
                    value={user.phone || ''}
                    onChange={(e) => setUser({...user, phone: e.target.value})}
                    placeholder="05xx xxx xx xx"
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 px-5 text-sm font-bold text-primary focus:border-accent transition-all outline-none"
                  />
                </div>

                <button 
                  type="submit"
                  disabled={updating}
                  className="bg-primary text-white w-full py-5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 disabled:opacity-50"
                >
                  {updating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save size={18} />}
                  Değişiklikleri Kaydet
                </button>
              </form>
            </motion.div>

            {/* Change Password */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-[32px] overflow-hidden bg-white shadow-xl shadow-slate-200/50"
            >
              <div className="px-8 py-6 border-b border-slate-50">
                <h3 className="font-black text-primary text-sm tracking-widest uppercase">ŞİFRE VE GÜVENLİK</h3>
              </div>
              <form onSubmit={handleChangePassword} className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">MEVCUT ŞİFRE</label>
                  <input 
                    type="password" 
                    value={passwords.current_password}
                    onChange={(e) => setPasswords({...passwords, current_password: e.target.value})}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 px-5 text-sm font-bold focus:border-accent transition-all outline-none"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">YENİ ŞİFRE</label>
                    <input 
                      type="password" 
                      value={passwords.new_password}
                      onChange={(e) => setPasswords({...passwords, new_password: e.target.value})}
                      placeholder="Min 8 karakter"
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 px-5 text-sm font-bold focus:border-accent transition-all outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">TEKRAR GİRİN</label>
                    <input 
                      type="password" 
                      value={passwords.confirm_password}
                      onChange={(e) => setPasswords({...passwords, confirm_password: e.target.value})}
                      placeholder="Tekrar girin"
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 px-5 text-sm font-bold focus:border-accent transition-all outline-none"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={updating}
                  className="bg-slate-100 text-primary w-full py-5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-200 transition-all border border-slate-200 disabled:opacity-50"
                >
                  {updating ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck size={18} />}
                  Şifreyi Güncelle
                </button>
              </form>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
