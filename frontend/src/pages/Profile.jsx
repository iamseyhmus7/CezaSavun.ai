import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Phone, Lock, Save, ShieldCheck, CheckCircle2, AlertCircle, Loader2, Camera, Key, Sparkles, Bell, Shield, Zap, CreditCard, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { apiFetch } from '../utils/api';

const TABS = [
  { key: 'profile', label: 'Kişisel Bilgiler', icon: User },
  { key: 'security', label: 'Güvenlik', icon: Shield },
  { key: 'membership', label: 'Üyelik ve Plan', icon: CreditCard },
  { key: 'ai', label: 'AI Ayarları', icon: Sparkles },
  { key: 'notifications', label: 'Bildirimler', icon: Bell },
];

const AI_TONES = [
  { key: 'aggressive', label: 'Agresif Savunma', desc: 'Güçlü, iddialı ve keskin argümanlarla savunma dilekçesi üretir.', emoji: '⚔️', icon: Zap, color: 'border-rose-500 text-rose-600 bg-rose-50' },
  { key: 'formal', label: 'Resmi / Formal', desc: 'Klasik hukuki dil, kurumsal ton ve ölçülü argümantasyon.', emoji: '🏛️', icon: Shield, color: 'border-accent text-accent bg-accent-muted' },
  { key: 'soft', label: 'Yumuşak Savunma', desc: 'Empatik, anlayışlı ve uzlaşmacı bir dil ile savunma.', emoji: '🤝', icon: CheckCircle2, color: 'border-emerald-500 text-emerald-600 bg-emerald-50' },
];

export default function Profile() {
  const { currentUser, loadData } = useOutletContext();
  const fileInputRef = React.useRef(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [updating, setUpdating] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [user, setUser] = useState({ name: '', surname: '', email: '', phone: '', is_verified: false });
  const [passwords, setPasswords] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [aiTone, setAiTone] = useState(() => localStorage.getItem('ai_tone') || 'formal');
  const [notifPrefs, setNotifPrefs] = useState(() => {
    try { return JSON.parse(localStorage.getItem('notif_prefs')) || { email: true, deadline_days: 3 }; }
    catch { return { email: true, deadline_days: 3 }; }
  });

  useEffect(() => { if (currentUser) setUser(currentUser); }, [currentUser]);
  useEffect(() => { localStorage.setItem('ai_tone', aiTone); }, [aiTone]);
  useEffect(() => { localStorage.setItem('notif_prefs', JSON.stringify(notifPrefs)); }, [notifPrefs]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault(); setUpdating(true);
    try {
      const res = await apiFetch('/auth/me', { method: 'PATCH', body: JSON.stringify({ name: user.name, surname: user.surname, phone: user.phone }) });
      if (res.ok) { toast.success('Profil güncellendi'); loadData(); } else { const err = await res.json(); toast.error(err.detail || 'Güncelleme başarısız'); }
    } catch { toast.error('Bir hata oluştu'); } finally { setUpdating(false); }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setAvatarPreview(e.target.result);
      reader.readAsDataURL(file);
      toast.success('Profil fotoğrafı seçildi. Backend entegrasyonu hazır.');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwords.new_password !== passwords.confirm_password) { toast.error('Şifreler eşleşmiyor'); return; }
    setUpdating(true);
    try {
      const res = await apiFetch('/auth/change-password', { method: 'POST', body: JSON.stringify({ current_password: passwords.current_password, new_password: passwords.new_password }) });
      if (res.ok) { toast.success('Şifre değiştirildi'); setPasswords({ current_password: '', new_password: '', confirm_password: '' }); } else { const err = await res.json(); toast.error(err.detail || 'Şifre değiştirme başarısız'); }
    } catch { toast.error('Bir hata oluştu'); } finally { setUpdating(false); }
  };

  if (!currentUser) return <div className="p-20 text-center text-slate-400 font-medium">Yükleniyor…</div>;

  return (
    <div className="p-6 lg:p-10 pb-24">
      <div className="max-w-6xl mx-auto space-y-8">
        <header>
          <h2 className="text-2xl font-bold text-primary">Hesap Ayarları</h2>
          <p className="text-sm text-slate-400 mt-1">Profil, güvenlik ve platform tercihlerinizi yönetin.</p>
        </header>

        <div className="grid md:grid-cols-[280px_1fr] gap-8 items-start">
          
          {/* LEFT: Sidebar */}
          <div className="flex flex-col space-y-6 sticky top-6">
            <div className="glass-card p-6 text-center flex flex-col items-center">
              <div className="relative inline-block mb-4">
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarChange} />
                <div className="w-28 h-28 bg-gradient-to-br from-primary to-primary-lighter rounded-[2rem] flex items-center justify-center text-white text-4xl font-black shadow-lg overflow-hidden ring-4 ring-white">
                  {avatarPreview ? (
                     <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                     `${user.name?.[0] || ''}${user.surname?.[0] || ''}`
                  )}
                </div>
                <button onClick={() => fileInputRef.current?.click()} className="absolute -bottom-2 -right-2 p-2.5 bg-white border border-slate-200 rounded-2xl shadow-lg text-slate-400 hover:text-accent transition-colors z-10">
                  <Camera size={18}/>
                </button>
              </div>
              <h3 className="font-extrabold text-lg text-primary">{user.name} {user.surname}</h3>
              <p className="text-sm text-slate-400 mb-4">{user.email}</p>
              <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold ${user.is_verified ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-warning-muted text-warning border border-warning/20'}`}>
                {user.is_verified ? <CheckCircle2 size={14}/> : <AlertCircle size={14}/>}
                {user.is_verified ? 'Doğrulanmış Hesap' : 'Onay Bekliyor'}
              </div>
            </div>

            <nav className="glass-card p-3 flex flex-col gap-1">
              {TABS.map(t => (
                <button key={t.key} onClick={() => setActiveTab(t.key)}
                  className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-bold transition-all
                  ${activeTab === t.key ? 'bg-primary text-white shadow-md shadow-primary/20' : 'text-slate-500 hover:bg-slate-50 hover:text-primary'}`}>
                  <div className="flex items-center gap-3">
                    <t.icon size={18} className={activeTab === t.key ? 'text-accent' : ''} />
                    {t.label}
                  </div>
                  {activeTab === t.key && <ChevronRight size={16} className="text-white/50" />}
                </button>
              ))}
            </nav>
          </div>

          {/* RIGHT: Content Area */}
          <div className="glass-card overflow-hidden min-h-[500px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === 'profile' && (
                  <div>
                    <div className="px-8 py-6 border-b border-slate-100 bg-white">
                       <div className="flex items-center gap-3 mb-1">
                          <span className="text-2xl">👤</span>
                          <h3 className="font-extrabold text-primary text-xl">Kişisel Bilgiler</h3>
                       </div>
                       <p className="text-sm text-slate-500 font-medium">Platformdaki temel kimlik ve iletişim bilgilerinizi yönetin.</p>
                    </div>
                    <form onSubmit={handleUpdateProfile} className="p-8 space-y-6">
                      <div className="grid sm:grid-cols-2 gap-6">
                        <div><label className="form-label">Ad</label><input type="text" value={user.name} onChange={e=>setUser({...user,name:e.target.value})} className="form-input shadow-inner focus:ring-2 focus:ring-primary/20"/></div>
                        <div><label className="form-label">Soyad</label><input type="text" value={user.surname} onChange={e=>setUser({...user,surname:e.target.value})} className="form-input shadow-inner focus:ring-2 focus:ring-primary/20"/></div>
                      </div>
                      <div><label className="form-label">Telefon Numarası</label><input type="tel" value={user.phone||''} onChange={e=>setUser({...user,phone:e.target.value})} placeholder="05xx xxx xx xx" className="form-input shadow-inner focus:ring-2 focus:ring-primary/20"/></div>
                      <div className="pt-4 border-t border-slate-100 flex justify-end">
                        <button type="submit" disabled={updating} className="btn-primary px-8 py-3 rounded-xl flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-primary/30">
                          {updating ? <Loader2 className="w-4 h-4 animate-spin"/> : <Save size={16}/>} Değişiklikleri Kaydet
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {activeTab === 'security' && (
                  <div>
                    <div className="px-8 py-6 border-b border-slate-100 bg-white">
                       <div className="flex items-center gap-3 mb-1">
                          <span className="text-2xl">🛡️</span>
                          <h3 className="font-extrabold text-primary text-xl">Şifre ve Güvenlik</h3>
                       </div>
                       <p className="text-sm text-slate-500 font-medium">Hesabınızı güvende tutmak için şifrenizi düzenli değiştirin.</p>
                    </div>
                    <form onSubmit={handleChangePassword} className="p-8 space-y-6">
                      <div><label className="form-label">Mevcut Şifre</label><input type="password" value={passwords.current_password} onChange={e=>setPasswords({...passwords,current_password:e.target.value})} placeholder="••••••••" className="form-input shadow-inner focus:ring-2 focus:ring-slate-900/20"/></div>
                      <div className="grid sm:grid-cols-2 gap-6">
                        <div><label className="form-label">Yeni Şifre</label><input type="password" value={passwords.new_password} onChange={e=>setPasswords({...passwords,new_password:e.target.value})} placeholder="Min 8 karakter" className="form-input shadow-inner focus:ring-2 focus:ring-slate-900/20"/></div>
                        <div><label className="form-label">Şifre Tekrar</label><input type="password" value={passwords.confirm_password} onChange={e=>setPasswords({...passwords,confirm_password:e.target.value})} placeholder="Tekrar girin" className="form-input shadow-inner focus:ring-2 focus:ring-slate-900/20"/></div>
                      </div>
                      <div className="pt-4 border-t border-slate-100 flex justify-end">
                        <button type="submit" disabled={updating} className="bg-slate-900 hover:bg-black text-white px-8 py-3 rounded-xl font-bold transition-colors flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-black/20">
                          {updating ? <Loader2 className="w-4 h-4 animate-spin"/> : <Key size={16}/>} Şifreyi Güncelle
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {activeTab === 'membership' && (
                  <div>
                    <div className="px-8 py-6 border-b border-slate-100 bg-white">
                       <div className="flex items-center gap-3 mb-1">
                          <span className="text-2xl">💎</span>
                          <h3 className="font-extrabold text-primary text-xl">Üyelik ve Plan</h3>
                       </div>
                       <p className="text-sm text-slate-500 font-medium">Mevcut abonelik durumunuzu ve haklarınızı görüntüleyin.</p>
                    </div>
                    <div className="p-8 space-y-6">
                       
                       <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] border border-slate-800">
                          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-500/30 to-purple-500/30 blur-[80px] rounded-full"></div>
                          <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-6">
                             <div>
                               <div className="flex items-center gap-2 mb-2">
                                  <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-bold tracking-widest text-white/80 border border-white/5 uppercase">Aktif Paket</span>
                                  <span className="flex h-2 w-2 relative"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span></span>
                               </div>
                               <h4 className="text-4xl font-black mb-1 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">PRO ENTERPRISE</h4>
                               <p className="text-sm font-medium text-slate-400">Sınırsız yapay zeka gücü ve öncelikli destek.</p>
                             </div>
                             <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-4xl shadow-inner shrink-0">
                                🚀
                             </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-8 border-t border-white/10 pt-6 mt-8 relative z-10">
                             <div>
                                <p className="text-white/50 text-xs font-bold uppercase tracking-wider mb-1">Kalan Dilekçe Hakkı</p>
                                <p className="text-emerald-400 font-black text-2xl flex items-center gap-2">Limitsiz <span className="text-lg">✨</span></p>
                             </div>
                             <div>
                                <p className="text-white/50 text-xs font-bold uppercase tracking-wider mb-1">Kayıt Tarihi</p>
                                <p className="text-white font-bold text-xl">{user.created_at ? new Date(user.created_at).toLocaleDateString('tr-TR', { day:'numeric', month:'long', year:'numeric' }) : '12 Mart 2026'}</p>
                             </div>
                          </div>
                       </div>

                       <div className="flex gap-4">
                          <button className="flex-1 py-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl font-bold text-slate-600 transition-colors shadow-sm">Faturaları Görüntüle</button>
                          <button className="flex-1 py-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl font-bold text-slate-600 transition-colors shadow-sm">Planı Değiştir</button>
                       </div>
                    </div>
                  </div>
                )}

                {activeTab === 'ai' && (
                  <div>
                    <div className="px-8 py-6 border-b border-slate-100 bg-white">
                       <div className="flex items-center gap-3 mb-1">
                          <span className="text-2xl">🧠</span>
                          <h3 className="font-extrabold text-primary text-xl">Yapay Zeka (AI) Tonu</h3>
                       </div>
                       <p className="text-sm text-slate-500 font-medium">Dilekçelerinizin hukuki agresifliğini ve yazım dilini belirleyin.</p>
                    </div>
                    <div className="p-8 grid gap-4">
                      {AI_TONES.map(tone => (
                        <button key={tone.key} onClick={() => setAiTone(tone.key)}
                          className={`w-full text-left p-6 rounded-2xl border-2 transition-all group relative overflow-hidden ${aiTone === tone.key ? tone.color + ' border-current shadow-lg bg-white scale-[1.01]' : 'border-slate-100 hover:border-slate-300 bg-slate-50'}`}>
                          {aiTone === tone.key && <div className="absolute right-0 top-0 w-32 h-32 bg-current opacity-5 rounded-full blur-2xl -mr-10 -mt-10"></div>}
                          <div className="flex items-center gap-5 relative z-10">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-sm ${aiTone === tone.key ? 'bg-white scale-110 transition-transform' : 'bg-white opacity-60 grayscale group-hover:grayscale-0 transition-all'}`}>
                               {tone.emoji}
                            </div>
                            <div>
                              <p className="font-extrabold text-lg">{tone.label}</p>
                              <p className={`text-sm mt-0.5 font-medium ${aiTone === tone.key ? 'opacity-90' : 'text-slate-500'}`}>{tone.desc}</p>
                            </div>
                            {aiTone === tone.key && <CheckCircle2 size={28} className="ml-auto shrink-0 drop-shadow-sm"/>}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'notifications' && (
                  <div>
                    <div className="px-8 py-6 border-b border-slate-100 bg-white">
                       <div className="flex items-center gap-3 mb-1">
                          <span className="text-2xl">🔔</span>
                          <h3 className="font-extrabold text-primary text-xl">Bildirim Tercihleri</h3>
                       </div>
                       <p className="text-sm text-slate-500 font-medium">Dilekçe durumları ve sistem uyarıları için bildirim ayarlarınız.</p>
                    </div>
                    <div className="p-8 space-y-8">
                      <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-5">
                           <div className="w-14 h-14 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-3xl shadow-inner">✉️</div>
                           <div>
                              <p className="font-extrabold text-primary text-lg">E-posta Bildirimleri</p>
                              <p className="text-sm text-slate-500 font-medium">Dilekçe üretim süreçleri hakkında e-posta alın.</p>
                           </div>
                        </div>
                        <button onClick={() => setNotifPrefs(p => ({...p, email: !p.email}))}
                          className={`w-14 h-8 rounded-full transition-colors relative shadow-inner ${notifPrefs.email ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                          <div className={`w-6 h-6 bg-white rounded-full shadow-md absolute top-1 transition-transform ${notifPrefs.email ? 'translate-x-[28px]' : 'translate-x-1'}`}/>
                        </button>
                      </div>
                      
                      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-3 mb-1">
                           <span className="text-xl">⏳</span>
                           <p className="font-extrabold text-primary text-lg">Deadline Hatırlatma Süresi</p>
                        </div>
                        <p className="text-sm text-slate-500 mb-6 font-medium ml-8">Tebliğ tarihinden ne kadar süre önce uyarılmak istersiniz?</p>
                        <div className="flex gap-3 ml-8">
                          {[1, 3, 5, 7].map(d => (
                            <button key={d} onClick={() => setNotifPrefs(p => ({...p, deadline_days: d}))}
                              className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all border-2 ${notifPrefs.deadline_days === d ? 'border-primary bg-primary text-white shadow-lg shadow-primary/20 scale-105' : 'border-slate-100 bg-slate-50 text-slate-500 hover:bg-slate-100 hover:border-slate-200'}`}>
                              {d} Gün Önce
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
