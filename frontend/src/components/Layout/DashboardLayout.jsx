import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Scale, Home, FolderOpen, Users, Calendar,
  Settings, LogOut, Search, Bell, Sparkles, X,
  Menu, BarChart3, UploadCloud, MessageSquare,
  ChevronLeft, ChevronRight, Check
} from 'lucide-react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { fetchMe, fetchPetitions, fetchNotifications, markNotificationRead, markAllNotificationsRead } from '../../utils/api';
import AIAssistant from './AIAssistant';

// ─── Time Formatter ──────────────────────────────────────────────────────────
const formatTime = (dateStr) => {
  let normalizedDate = dateStr;
  if (dateStr && !dateStr.includes('Z') && !dateStr.includes('+')) {
    normalizedDate = dateStr + 'Z';
  }
  const date = new Date(normalizedDate);
  const now = new Date();
  const diff = Math.max(0, (now - date) / 1000);
  if (diff < 60) return "Az önce";
  if (diff < 3600) return `${Math.floor(diff / 60)} dk önce`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} sa önce`;
  return date.toLocaleDateString('tr-TR');
};

// ─── Page titles mapping ─────────────────────────────────────────────────────
const PAGE_TITLES = {
  '/dashboard': 'Kontrol Paneli',
  '/petitions': 'Dilekçelerim',
  '/clients': 'Müvekkiller',
  '/calendar': 'Hukuki Takvim',
  '/profile': 'Hesap Ayarları',
  '/upload': 'Ceza Yükleme',
  '/admin': 'Yönetim Paneli',
};

// ─── Navigation items ────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { path: '/dashboard', icon: Home, label: 'Anasayfa' },
  { path: '/upload', icon: UploadCloud, label: 'Ceza Yükle' },
  { path: '/petitions', icon: FolderOpen, label: 'Dilekçelerim' },
  { path: '/clients', icon: Users, label: 'Müvekkiller' },
  { path: '/calendar', icon: Calendar, label: 'Takvim' },
];

export default function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(null);
  const [petitions, setPetitions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  // ── Close dropdowns on click outside ──
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setIsNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const loadData = useCallback(async () => {
    try {
      const [user, pts, notifs] = await Promise.all([
        fetchMe(),
        fetchPetitions(),
        fetchNotifications()
      ]);
      setCurrentUser(user);
      setPetitions(pts);
      setNotifications(notifs);

      const unread = notifs.filter(n => !n.is_read);
      if (unread.length > 0) {
        const latest = unread[0];
        if (latest.id !== localStorage.getItem('last_notif_id')) {
          localStorage.setItem('last_notif_id', latest.id);
          try { new Audio("https://cdn.pixabay.com/download/audio/2021/08/04/audio_0625c1539c.mp3").play(); } catch(e){}
          toast(latest.title, { icon: '🔔' });
        }
      }
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

  const deadlines = (petitions || [])
    .filter(p => p.created_at)
    .map(p => {
      const created = new Date(p.created_at);
      const deadline = new Date(created);
      deadline.setDate(created.getDate() + 15);
      return { ...p, deadline };
    })
    .filter(p => !isNaN(p.deadline.getTime()))
    .sort((a,b) => a.deadline - b.deadline);

  const filteredPetitions = (petitions || []).filter(p => {
    const query = (searchQuery || '').toLowerCase();
    const name = (p.client_name || '').toLowerCase();
    const plate = (p.vehicle_plate || '').toLowerCase();
    const id = String(p.id || '').toLowerCase();
    return name.includes(query) || plate.includes(query) || id.includes(query);
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const currentPageTitle = PAGE_TITLES[location.pathname] || 'CezaSavun.ai';

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead();
    loadData();
  };

  // ── Sidebar content (shared between desktop and mobile) ──
  const SidebarContent = ({ isMobile = false }) => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-6 border-b border-slate-100 ${!sidebarExpanded && !isMobile ? 'justify-center' : ''}`}>
        <div
          className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/10 cursor-pointer hover:scale-105 transition-transform shrink-0"
          onClick={() => navigate('/dashboard')}
        >
          <Scale className="text-white w-5 h-5" />
        </div>
        {(sidebarExpanded || isMobile) && (
          <div className="overflow-hidden">
            <h1 className="text-base font-bold text-primary leading-none tracking-tight">
              CezaSavun<span className="text-accent">.ai</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">Hukuki Savunma Platformu</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className={`text-[10px] font-semibold text-slate-300 uppercase tracking-wider px-3 mb-2 ${!sidebarExpanded && !isMobile ? 'sr-only' : ''}`}>
          Ana Menü
        </p>
        {NAV_ITEMS.map(item => (
          <SidebarNavItem
            key={item.path}
            icon={<item.icon size={20} />}
            label={item.label}
            active={isActive(item.path)}
            expanded={sidebarExpanded || isMobile}
            onClick={() => {
              navigate(item.path);
              if (isMobile) setMobileSidebarOpen(false);
            }}
          />
        ))}

        {currentUser?.is_admin && (
          <>
            <div className="my-4 border-t border-slate-100" />
            <p className={`text-[10px] font-semibold text-slate-300 uppercase tracking-wider px-3 mb-2 ${!sidebarExpanded && !isMobile ? 'sr-only' : ''}`}>
              Yönetim
            </p>
            <SidebarNavItem
              icon={<BarChart3 size={20} />}
              label="Yönetim Paneli"
              active={isActive('/admin')}
              expanded={sidebarExpanded || isMobile}
              onClick={() => {
                navigate('/admin');
                if (isMobile) setMobileSidebarOpen(false);
              }}
            />
          </>
        )}
      </nav>

      {/* Bottom section */}
      <div className="px-3 pb-4 space-y-1 border-t border-slate-100 pt-4">
        <SidebarNavItem
          icon={<Settings size={20} />}
          label="Ayarlar"
          active={isActive('/profile')}
          expanded={sidebarExpanded || isMobile}
          onClick={() => {
            navigate('/profile');
            if (isMobile) setMobileSidebarOpen(false);
          }}
        />
        <SidebarNavItem
          icon={<LogOut size={20} />}
          label="Çıkış Yap"
          expanded={sidebarExpanded || isMobile}
          onClick={handleLogout}
          danger
        />
      </div>

      {/* User card (when expanded) */}
      {(sidebarExpanded || isMobile) && currentUser && (
        <div className="px-4 pb-4">
          <div className="bg-slate-50 rounded-xl p-3 flex items-center gap-3">
            <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0">
              {currentUser.name?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-primary truncate">
                {currentUser.name} {currentUser.surname}
              </p>
              <p className="text-[11px] text-slate-400 truncate">{currentUser.email}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex h-screen bg-bg-main overflow-hidden">

      {/* ═══ DESKTOP SIDEBAR ═══ */}
      <aside
        className={`hidden md:flex flex-col bg-white border-r border-slate-200/80 shrink-0 transition-all duration-300 ease-in-out print:hidden
          ${sidebarExpanded ? 'w-64' : 'w-[72px]'}`}
      >
        <SidebarContent />
      </aside>

      {/* ═══ MOBILE SIDEBAR OVERLAY ═══ */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileSidebarOpen(false)}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[80] md:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed left-0 top-0 h-full w-[280px] bg-white shadow-2xl z-[90] md:hidden"
            >
              <SidebarContent isMobile />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ═══ MAIN AREA ═══ */}
      <div className="flex-1 flex flex-col min-w-0 relative">

        {/* TOP HEADER */}
        <header className="h-16 bg-white/80 backdrop-blur-xl border-b border-slate-200/80 px-4 md:px-6 flex items-center justify-between shrink-0 z-50 print:hidden">
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="md:hidden p-2 -ml-1 text-slate-500 hover:text-primary hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Menu size={22} />
            </button>

            {/* Desktop sidebar toggle */}
            <button
              onClick={() => setSidebarExpanded(!sidebarExpanded)}
              className="hidden md:flex p-2 -ml-1 text-slate-400 hover:text-primary hover:bg-slate-100 rounded-lg transition-colors"
            >
              {sidebarExpanded ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
            </button>

            {/* Page title */}
            <div className="hidden sm:block">
              <h2 className="text-lg font-bold text-primary leading-none">{currentPageTitle}</h2>
            </div>

            {/* Search */}
            <div className="hidden lg:flex items-center relative ml-4">
              <Search className="absolute left-3 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Dilekçe, müvekkil veya plaka ara…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-72 pl-9 pr-4 py-2 bg-slate-50 border border-transparent focus:bg-white focus:border-slate-200 rounded-xl text-sm transition-all outline-none placeholder:text-slate-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 text-slate-400 hover:text-primary"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* AI Assistant Toggle */}
            <button
              onClick={() => setIsAIAssistantOpen(true)}
              className="flex items-center gap-2 px-3 py-2 text-accent hover:bg-accent/5 rounded-xl transition-colors group"
              title="AI Asistan"
            >
              <Sparkles size={18} className="group-hover:scale-110 transition-transform" />
              <span className="hidden lg:inline text-sm font-semibold">AI Asistan</span>
            </button>

            <div className="w-px h-6 bg-slate-200 mx-1" />

            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className={`relative p-2 rounded-xl transition-all ${
                  isNotificationsOpen ? 'bg-accent text-white' : 'text-slate-400 hover:bg-slate-100 hover:text-primary'
                }`}
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 min-w-[18px] h-[18px] flex items-center justify-center bg-danger text-white text-[10px] font-bold rounded-full px-1 animate-badge-pop">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {isNotificationsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-96 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-primary text-sm">Bildirimler</h4>
                        {unreadCount > 0 && (
                          <span className="bg-danger/10 text-danger text-[11px] font-semibold px-2 py-0.5 rounded-md">
                            {unreadCount} yeni
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {unreadCount > 0 && (
                          <button
                            onClick={handleMarkAllRead}
                            className="text-[11px] font-medium text-accent hover:underline"
                          >
                            Tümünü okundu yap
                          </button>
                        )}
                        <button onClick={() => setIsNotificationsOpen(false)} className="text-slate-400 hover:text-primary p-1">
                          <X size={16} />
                        </button>
                      </div>
                    </div>

                    {/* List */}
                    <div className="max-h-[400px] overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="py-16 text-center">
                          <Bell size={32} className="mx-auto text-slate-200 mb-3" />
                          <p className="text-sm font-medium text-slate-400">Henüz bildirim yok</p>
                        </div>
                      ) : notifications.map(notif => (
                        <NotificationItem
                          key={notif.id}
                          title={notif.title}
                          desc={notif.message}
                          time={formatTime(notif.created_at)}
                          isRead={notif.is_read}
                          icon={
                            notif.type === 'deadline' ? <Calendar className="text-danger" size={16} /> :
                            notif.type === 'success' ? <Check className="text-success" size={16} /> :
                            <Bell className="text-accent" size={16} />
                          }
                          onClick={async () => {
                            if (!notif.is_read) {
                              await markNotificationRead(notif.id);
                              loadData();
                            }
                            if (notif.link) navigate(notif.link);
                            setIsNotificationsOpen(false);
                          }}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-3 pl-3 py-1 rounded-xl hover:bg-slate-50 transition-colors"
              >
                <div className="w-9 h-9 bg-primary/10 text-primary rounded-lg flex items-center justify-center font-bold text-sm">
                  {currentUser ? currentUser.name.charAt(0).toUpperCase() : '?'}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-semibold text-primary leading-none">
                    {currentUser ? `${currentUser.name} ${currentUser.surname}` : 'Yükleniyor…'}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {currentUser?.is_verified ? '✓ Doğrulanmış' : 'Onay Bekliyor'}
                  </p>
                </div>
              </button>

              <AnimatePresence>
                {profileDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50"
                  >
                    <button
                      onClick={() => { navigate('/profile'); setProfileDropdownOpen(false); }}
                      className="w-full px-4 py-2.5 text-left text-sm font-medium text-slate-600 hover:bg-slate-50 flex items-center gap-3"
                    >
                      <Settings size={16} className="text-slate-400" /> Hesap Ayarları
                    </button>
                    <div className="border-t border-slate-100 my-1" />
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2.5 text-left text-sm font-medium text-danger hover:bg-danger-muted flex items-center gap-3"
                    >
                      <LogOut size={16} /> Çıkış Yap
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 overflow-y-auto bg-bg-main">
          <Outlet context={{
            currentUser, petitions, loadData, loadingList: loading,
            searchQuery, filteredPetitions,
            openNotifications: () => setIsNotificationsOpen(true),
            openAIAssistant: () => setIsAIAssistantOpen(true)
          }} />
        </main>
      </div>

      {/* ═══ AI ASSISTANT DRAWER ═══ */}
      <AIAssistant
        isOpen={isAIAssistantOpen}
        onClose={() => setIsAIAssistantOpen(false)}
        currentPage={location.pathname}
        currentUser={currentUser}
      />
    </div>
  );
}

// ─── Sidebar Nav Item ────────────────────────────────────────────────────────
function SidebarNavItem({ icon, label, active, expanded, onClick, danger = false }) {
  return (
    <button
      onClick={onClick}
      title={!expanded ? label : undefined}
      className={`sidebar-item w-full group relative
        ${active ? 'sidebar-item-active' : danger ? 'text-slate-400 hover:text-danger hover:bg-danger-muted' : 'sidebar-item-inactive'}
        ${!expanded ? 'justify-center px-0' : ''}`}
    >
      <div className={`sidebar-icon ${active ? 'text-accent' : danger ? 'text-slate-400 group-hover:text-danger' : 'text-slate-400 group-hover:text-primary'}`}>
        {icon}
      </div>
      {expanded && (
        <span className={`truncate ${active ? '' : ''}`}>{label}</span>
      )}
      {active && expanded && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-accent rounded-r-full" />
      )}
      {/* Tooltip for collapsed state */}
      {!expanded && (
        <span className="absolute left-[calc(100%+8px)] bg-primary text-white text-xs font-medium px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-lg pointer-events-none">
          {label}
        </span>
      )}
    </button>
  );
}

// ─── Notification Item ───────────────────────────────────────────────────────
function NotificationItem({ title, desc, time, icon, isRead, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-5 py-3.5 transition-colors flex gap-3 ${
        isRead ? 'bg-white hover:bg-slate-50' : 'bg-accent/5 hover:bg-accent/10'
      }`}
    >
      <div className="w-9 h-9 rounded-lg bg-white border border-slate-100 flex items-center justify-center shrink-0 shadow-sm">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm leading-tight mb-0.5 ${isRead ? 'font-medium text-slate-600' : 'font-semibold text-primary'}`}>
          {title}
        </p>
        <p className="text-xs text-slate-400 leading-tight line-clamp-2">{desc}</p>
        <p className="text-[11px] text-slate-300 mt-1">{time}</p>
      </div>
      {!isRead && <div className="w-2 h-2 bg-accent rounded-full my-auto shrink-0" />}
    </button>
  );
}
