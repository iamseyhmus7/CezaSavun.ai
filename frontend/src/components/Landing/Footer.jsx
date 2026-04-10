import React from 'react';
import { Scale, Mail } from "lucide-react";
import { FaTwitter, FaGithub, FaLinkedin } from "react-icons/fa";
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="py-20 bg-deep-navy-dark border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6">

        <div className="grid md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-6 w-fit group">
              <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <Scale className="text-white w-5 h-5" />
              </div>
              <span className="text-lg font-black tracking-tight text-white uppercase italic">
                cezaSavun<span className="text-accent lowercase not-italic">.ai</span>
              </span>
            </Link>
            <p className="text-slate-500 font-medium max-w-sm mb-8 leading-relaxed">
              Yapay zeka teknolojileri ile hukuk süreçlerini herkes için erişilebilir, hızlı ve güvenilir hale getiriyoruz.
            </p>
            <div className="flex items-center gap-5">
              <SocialIcon icon={<FaTwitter size={20} />} />
              <SocialIcon icon={<FaGithub size={20} />} />
              <SocialIcon icon={<FaLinkedin size={20} />} />
              <SocialIcon icon={<Mail size={20} />} />
            </div>
          </div>

          <div>
            <h4 className="text-white font-black uppercase text-xs tracking-widest mb-6">Platform</h4>
            <ul className="space-y-4">
              <li><FooterLink href="/#features">Özellikler</FooterLink></li>
              <li><FooterLink href="/#how-it-works">Nasıl Çalışır?</FooterLink></li>
              <li><FooterLink href="/auth/login">Giriş Yap</FooterLink></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-black uppercase text-xs tracking-widest mb-6">Hukuki</h4>
            <ul className="space-y-4">
              <li><Link to="/legal/terms" className="text-sm font-bold text-slate-500 hover:text-white transition-colors">Kullanım Koşulları</Link></li>
              <li><Link to="/legal/privacy" className="text-sm font-bold text-slate-500 hover:text-white transition-colors">Gizlilik Politikası</Link></li>
              <li><Link to="/legal/kvkk" className="text-sm font-bold text-slate-500 hover:text-white transition-colors">KVKK Aydınlatma</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden">
          <p className="text-slate-600 text-[10px] font-bold uppercase tracking-widest">
            © 2026 CezaSavun.ai — TÜM HAKLARI SAKLIDIR.
          </p>
          <div className="flex gap-4">
            <div className="px-3 py-1 bg-white/5 rounded-full text-[8px] font-black text-slate-500 tracking-tighter uppercase border border-white/5">v2.0-MVP</div>
            <div className="px-3 py-1 bg-accent/5 rounded-full text-[8px] font-black text-accent tracking-tighter uppercase border border-accent/5">Sistem Aktif</div>
          </div>
        </div>

      </div>
    </footer>
  );
}

function SocialIcon({ icon }) {
  return (
    <a href="#" className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-accent hover:bg-accent/10 hover:border-accent/20 transition-all">
      {icon}
    </a>
  );
}

function FooterLink({ href, children }) {
  return (
    <a
      href={href || '#'}
      className="text-sm font-bold text-slate-500 hover:text-white transition-colors cursor-pointer"
    >
      {children}
    </a>
  );
}
