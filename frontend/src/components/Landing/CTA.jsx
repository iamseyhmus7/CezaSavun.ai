import React from 'react';
import { motion, useMotionTemplate, useMotionValue } from 'framer-motion';
import { ArrowRight, Target, Zap, ShieldCheck, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CTA() {
  const navigate = useNavigate();

  // Mouse takip ışığı (Kusursuz performans için)
  let mouseX = useMotionValue(0);
  let mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }) {
    let { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <section className="py-20 bg-deep-navy relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-6">

        <motion.div
          onMouseMove={handleMouseMove}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="group relative p-8 md:p-16 bg-white/[0.02] rounded-[48px] border border-white/5 overflow-hidden shadow-2xl"
        >
          {/* 🔦 İnteraktif Işık Hüzmesi */}
          <motion.div
            className="pointer-events-none absolute -inset-px rounded-[48px] opacity-0 group-hover:opacity-100 transition duration-500"
            style={{
              background: useMotionTemplate`
                radial-gradient(
                  500px circle at ${mouseX}px ${mouseY}px,
                  rgba(56, 189, 248, 0.1),
                  transparent 80%
                )
              `,
            }}
          />

          <div className="relative z-10 flex flex-col items-center">

            {/* Üst İkon (Küçültüldü) */}
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(56,189,248,0.2)] mb-8"
            >
              <Target className="text-deep-navy w-8 h-8" />
            </motion.div>

            {/* Başlık (Boyutu Optimize Edildi) */}
            <h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tighter text-center leading-[1.1]">
              Hakkınızı Savunmak <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-white to-accent bg-300% animate-gradient italic">
                Hiç Bu Kadar Zeki
              </span> <br />
              Olmamıştı.
            </h2>

            <p className="text-base md:text-lg text-slate-400 font-medium mb-12 max-w-2xl mx-auto text-center leading-relaxed">
              CezaSavun.ai ile binlerce kullanıcı hukuki sürecini <br className="hidden md:block" />
              <span className="text-white/90">otopilota bağladı.</span> Sen de bugün aramıza katıl.
            </p>

            {/* 📊 Bento Stats (Daha Kompakt) */}
            <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
              <div className="flex items-center gap-3 p-5 bg-white/[0.03] border border-white/5 rounded-2xl">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent shrink-0">
                  <Zap size={20} />
                </div>
                <div>
                  <div className="text-xl font-black text-white">0.4sn</div>
                  <div className="text-[9px] text-slate-500 uppercase font-bold tracking-widest">Yanıt Hızı</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-5 bg-white/[0.03] border border-white/5 rounded-2xl">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <div className="text-xl font-black text-white">100%</div>
                  <div className="text-[9px] text-slate-500 uppercase font-bold tracking-widest">KVKK Güvenli</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-5 bg-white/[0.03] border border-white/5 rounded-2xl">
                <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-500 shrink-0">
                  <Activity size={20} />
                </div>
                <div>
                  <div className="text-xl font-black text-white">5000+</div>
                  <div className="text-[9px] text-slate-500 uppercase font-bold tracking-widest">Kullanıcı</div>
                </div>
              </div>
            </div>

            {/* Aksiyon Alanı */}
            <div className="flex flex-col items-center gap-8">
              <motion.button
                onClick={() => navigate('/auth/register')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="group relative px-10 py-5 bg-white text-deep-navy font-black rounded-2xl text-lg shadow-xl transition-all overflow-hidden"
              >
                <div className="absolute inset-0 bg-accent translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                <span className="relative z-10 flex items-center gap-2 group-hover:text-deep-navy">
                  Ücretsiz Başla
                  <ArrowRight size={20} />
                </span>
              </motion.button>

              <div className="flex flex-col items-center gap-3">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-deep-navy bg-slate-800 flex items-center justify-center text-[7px] font-bold text-white uppercase">
                      User
                    </div>
                  ))}
                </div>
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest italic">
                  Son 24 saatte 150+ yeni itiraz oluşturuldu
                </p>
              </div>
            </div>

          </div>

          {/* Köşe Işıkları (Optimize Edildi) */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 blur-[100px] -z-10" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-sky-500/5 blur-[100px] -z-10" />
        </motion.div>
      </div>
    </section>
  );
}