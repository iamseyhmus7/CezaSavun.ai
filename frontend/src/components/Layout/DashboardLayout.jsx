import React, { useState, useEffect, useCallback } from 'react';
import { 
  Scale, Home, FolderOpen, Users, Calendar, 
  Settings, LogOut, Search, Bell, Sparkles, X,
  Menu
} from 'lucide-react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { fetchMe, fetchPetitions } from '../../utils/api';

export default function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(null);
  const [petitions, setPetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = useCallback(async () => {
    try {
      const [user, pts] = await Promise.all([fetchMe(), fetchPetitions()]);
      setCurrentUser(user);
      setPetitions(pts);
    } catch (e) {
      console.error('Veri yükleme hatası:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/auth/login';
  };

  const isActive = (path) => location.pathname === path;

  // Highlight deadlines (15 days from creation)
  const deadlines = (petitions || [])
    .filter(p => p.created_at) // Sadece tarihi olanlar
    .map(p => {
      const created = new Date(p.created_at);
      const deadline = new Date(created);
      deadline.setDate(created.getDate() + 15);
      return { ...p, deadline };
    })
    .filter(p => !isNaN(p.deadline.getTime())) // Geçersiz tarihleri ele
    .sort((a,b) => a.deadline - b.deadline);

  // Search logic (extra safe check)
  const filteredPetitions = (petitions || []).filter(p => {
    const query = (searchQuery || '').toLowerCase();
    const name = (p.client_name || '').toLowerCase();
    const plate = (p.vehicle_plate || '').toLowerCase();
    const id = String(p.id || '').toLowerCase();
    return name.includes(query) || plate.includes(query) || id.includes(query);
  });

  return (
    <div className="flex h-screen bg-bg-main overflow-hidden font-inter text-slate-800">
      
      {/* ═══ 1. SIDEBAR ═══ */}
      <aside className="hidden md:flex w-20 bg-white border-r border-slate-200 flex-col items-center py-8 gap-8 shrink-0 print:hidden">
        <div 
          className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 cursor-pointer hover:scale-105 transition-transform"
          onClick={() => navigate('/dashboard')}
        >
          <Scale className="text-white w-7 h-7" />
        </div>

        <nav className="flex flex-col gap-4">
          <SidebarItem 
            icon={<Home size={22} />} 
            active={isActive('/dashboard')} 
            onClick={() => navigate('/dashboard')}
            label="Anasayfa"
          />
          <SidebarItem 
            icon={<FolderOpen size={22} />} 
            active={isActive('/petitions')} 
            onClick={() => navigate('/petitions')}
            label="Dilekçelerim"
          />
          <SidebarItem 
            icon={<Users size={22} />} 
            active={isActive('/clients')} 
            onClick={() => navigate('/clients')}
            label="Müvekkiller"
          />
          <SidebarItem 
            icon={<Calendar size={22} />} 
            active={isActive('/calendar')} 
            onClick={() => navigate('/calendar')}
            label="Takvim"
          />
        </nav>

        <div className="mt-auto flex flex-col gap-4">
          <SidebarItem 
            icon={<Settings size={22} />} 
            active={isActive('/profile')} 
            onClick={() => navigate('/profile')}
            label="Ayarlar"
          />
          <SidebarItem 
            icon={<LogOut size={22} />} 
            onClick={handleLogout}
            label="Çıkış"
          />
        </div>
      </aside>

      {/* ═══ 2. MAIN AREA ═══ */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        
        {/* TOP HEADER */}
        <header className="h-20 bg-white/50 backdrop-blur-md border-b border-slate-200 px-4 md:px-8 flex items-center justify-between shrink-0 z-50 print:hidden">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-extrabold text-primary flex items-center gap-2">
              CezaSavun<span className="text-accent lowercase">.ai</span>
            </h1>
            
            {/* Dynamic Search Bar */}
            <div className="hidden lg:flex items-center relative ml-8">
              <Search className="absolute left-4 text-slate-400" size={18} />
              <input 
                type="text"
                placeholder="Dilekçe, müvekkil veya plaka ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-80 pl-11 pr-4 py-2.5 bg-slate-100 border-transparent focus:bg-white focus:border-accent/30 rounded-2xl text-sm font-medium transition-all outline-none"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 text-slate-400 hover:text-primary"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Notifications */}
            <div className="relative">
              <button 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all relative ${isNotificationsOpen ? 'bg-primary text-white' : 'text-slate-400 hover:bg-slate-100'}`}
              >
                <Bell size={20} />
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
              </button>
              
              <AnimatePresence>
                {isNotificationsOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-3 w-80 bg-white rounded-3xl shadow-2xl border border-slate-100 p-4 z-50"
                  >
                    <div className="flex items-center justify-between mb-4 px-2">
                      <h4 className="font-black text-primary text-sm tracking-tight text-center">BİLDİRİMLER</h4>
                      <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold">YENİ</span>
                    </div>
                    <div className="space-y-2">
                      <NotificationItem 
                        title="Dilekçe Hazır" 
                        desc="34 ABC 123 plakalı dilekçe tamamlandı."
                        time="5 dk önce"
                        icon={<Sparkles className="text-accent" size={14} />}
                      />
                      <NotificationItem 
                        title="Süre Yaklaşıyor" 
                        desc="Mehmet Yılmaz'ın itiraz süresi yarın doluyor."
                        time="1 sa önce"
                        icon={<Calendar className="text-amber-500" size={14} />}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile Brief */}
            <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
              <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center font-black text-sm border border-primary/5">
                {currentUser ? currentUser.name.charAt(0).toUpperCase() : '?'}
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-black text-primary leading-none uppercase tracking-tighter">
                  {currentUser ? `${currentUser.name} ${currentUser.surname}` : 'Yükleniyor...'}
                </p>
                <p className="text-[10px] text-slate-400 font-bold mt-1">
                  {currentUser?.is_verified ? 'Doğrulanmış Hesap' : 'Onay Bekliyor'}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 overflow-y-auto bg-[#F8FAFC]">
          <Outlet context={{ 
            currentUser, petitions, loadData, loadingList: loading, 
            searchQuery, filteredPetitions, openNotifications: () => setIsNotificationsOpen(true) 
          }} />
        </main>
      </div>
    </div>
  );
}

function SidebarItem({ icon, active, onClick, label }) {
  return (
    <div 
      onClick={onClick}
      title={label}
      className={`sidebar-item group relative ${active ? 'sidebar-item-active' : 'sidebar-item-inactive'}`}
    >
      {icon}
      {!active && (
        <span className="absolute left-20 bg-primary text-white text-[10px] font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-xl pointer-events-none uppercase tracking-widest">
          {label}
        </span>
      )}
    </div>
  );
}

function NotificationItem({ title, desc, time, icon }) {
  return (
    <div className="p-3 hover:bg-slate-50 rounded-2xl transition-colors cursor-pointer group border border-transparent hover:border-slate-100">
      <div className="flex gap-3">
        <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
          {icon}
        </div>
        <div className="flex-1">
          <p className="text-xs font-black text-primary mb-0.5">{title}</p>
          <p className="text-[10px] text-slate-500 font-medium leading-tight">{desc}</p>
          <p className="text-[9px] text-slate-400 font-bold mt-1.5 uppercase tracking-widest">{time}</p>
        </div>
      </div>
    </div>
  );
}
