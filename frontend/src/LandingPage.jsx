import React from 'react';
import { motion } from 'framer-motion';

// components/landing dizinindeki 8 dosyanın tamamı:
import Navbar from './components/Landing/Navbar';
import Hero from './components/Landing/Hero';
import Features from './components/Landing/Features';
import HowItWorks from './components/Landing/HowItWorks';
import ProcessDiagram from './components/Landing/ProcessDiagram';
import ExpandableFeatures from './components/Landing/ExpandableFeatures';
import CTA from './components/Landing/CTA';
import Footer from './components/Landing/Footer';

export default function LandingPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bg-deep-navy font-sans scroll-smooth"
    >
      {/* 1. Navigasyon Çubuğu */}
      <Navbar />

      <main>
        {/* 2. Ana Karşılama Bölümü */}
        <Hero />

        {/* 3. Dijital Röntgen (Temel Özellikler) */}
        <Features />

        {/* 4. İş Akışı Adımları (Nasıl Çalışır?) */}
        <HowItWorks />

        {/* 5. Teknik Mimari Şeması (Boru Hattı) */}
        <ProcessDiagram />

        {/* 6. İnteraktif Detay Kartları (Açılabilir Bölümler) */}
        <ExpandableFeatures />

        {/* 7. Alt Harekete Geçirici Mesaj */}
        <CTA />
      </main>

      {/* 8. Sayfa Alt Bilgisi */}
      <Footer />
    </motion.div>
  );
}