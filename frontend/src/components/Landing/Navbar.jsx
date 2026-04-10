import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scale, Menu, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'py-4 dark-glass-strong' : 'py-6 bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 transition-transform hover:scale-[1.02] group">
          <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(56,189,248,0.4)] group-hover:scale-110 transition-transform">
            <Scale className="text-white w-6 h-6" />
          </div>
          <span className="text-xl font-black tracking-tight text-white uppercase italic">
            cezaSavunma<span className="text-accent underline decoration-2 decoration-accent/30 not-italic lowercase">.ai</span>
          </span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          <NavLink href="/#features">Özellikler</NavLink>
          <NavLink href="/#how-it-works">Nasıl Çalışır?</NavLink>
          <div className="h-6 w-[1px] bg-white/10 mx-2" />
          <Link 
            to="/auth/login"
            className="text-sm font-bold text-white hover:text-accent transition-colors"
          >
            Giriş Yap
          </Link>
          <button 
            onClick={() => navigate('/auth/register')}
            className="px-6 py-2.5 bg-accent text-deep-navy font-black text-sm rounded-xl hover:bg-white hover:scale-105 transition-all active:scale-95 shadow-lg shadow-accent/20"
          >
            Hemen Başla
          </button>
        </div>

        {/* Mobile Toggle */}
        <button 
          className="md:hidden text-white"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden dark-glass-strong border-t border-white/10 overflow-hidden"
          >
            <div className="px-6 py-8 flex flex-col gap-6">
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className="text-lg font-bold text-white">Özellikler</a>
              <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="text-lg font-bold text-white">Nasıl Çalışır?</a>
              <div className="h-[1px] w-full bg-white/10" />
              <Link to="/auth/login" onClick={() => setMobileMenuOpen(false)} className="text-lg font-bold text-white text-left">Giriş Yap</Link>
              <button 
                onClick={() => { navigate('/auth/register'); setMobileMenuOpen(false); }}
                className="w-full py-4 bg-accent text-deep-navy font-black text-center rounded-2xl"
              >
                Hemen Başla
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

function NavLink({ href, children }) {
  return (
    <a 
      href={href} 
      className="text-sm font-bold text-slate-300 hover:text-white transition-colors tracking-wide"
    >
      {children}
    </a>
  );
}
