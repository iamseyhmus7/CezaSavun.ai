import React from 'react';
import { motion } from 'framer-motion';
import { Scale, Home, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-deep-navy flex flex-col items-center justify-center p-6 relative overflow-hidden font-inter">
      {/* Background Decor */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center relative z-10"
      >
        <div className="w-24 h-24 bg-white/5 border border-white/10 rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-2xl backdrop-blur-xl">
          <AlertCircle size={48} className="text-accent" />
        </div>

        <h1 className="text-[120px] font-black text-white leading-none tracking-tighter mb-4 opacity-20">404</h1>

        <div className="-mt-16">
          <h2 className="text-3xl font-black text-white mb-4 tracking-tight uppercase">SAYFA BULUNAMADI</h2>
          <p className="text-slate-400 font-bold max-w-md mx-auto mb-10 leading-relaxed">
            Aradığınız sayfa taşınmış, silinmiş veya hiç var olmamış olabilir. Hukuki süreçlerinize geri dönmek ister misiniz?
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/"
              className="flex items-center gap-3 bg-accent text-deep-navy font-black py-4 px-8 rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-accent/20"
            >
              <Home size={20} />
              Anasayfa'ya Dön
            </Link>

            <a
              href="mailto:destek@cezasavun.ai"
              className="text-slate-500 font-bold hover:text-white transition-colors"
            >
              Destek Bildir
            </a>
          </div>
        </div>
      </motion.div>

      {/* Brand */}
      <div className="absolute bottom-12 flex items-center gap-2 opacity-30">
        <Scale size={20} className="text-accent" />
        <span className="text-sm font-black text-white uppercase tracking-widest italic">CezaSavun.ai</span>
      </div>
    </div>
  );
}
