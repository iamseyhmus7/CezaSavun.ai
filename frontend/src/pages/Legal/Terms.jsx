import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default function Terms() {
  return (
    <div className="space-y-12">
      <header>
        <h1 className="text-4xl font-black text-white mb-4 tracking-tight">Kullanım Koşulları</h1>
        <p className="text-slate-400 font-bold">Platform Kullanım Şartları ve Hukuki Sorumluluklar</p>
      </header>

      {/* CRITICAL DISCLAIMER */}
      <section className="p-8 bg-amber-500/10 border border-amber-500/20 rounded-[32px] flex items-start gap-6 shadow-2xl shadow-amber-500/5">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
          <AlertTriangle size={32} />
        </div>
        <div className="space-y-3">
          <h3 className="text-xl font-black text-amber-500 tracking-tight">ÖNEMLİ HUKUKİ UYARI (DISCLAIMER)</h3>
          <p className="text-slate-200 text-base font-bold leading-relaxed">
            CezaSavun.ai bir yapay zeka aracıdır ve <span className="text-white underline decoration-2 decoration-amber-500">kesinlikle gerçek bir avukat veya hukuki danışmanlık hizmeti sunmaz.</span> Üretilen dilekçeler bilgilendirme amaçlıdır. Bu belgelerin doğruluğunu kontrol etmek, imzalamak ve adli makamlara sunmak tamamen kullanıcının kendi sorumluluğundadır.
          </p>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-black text-accent tracking-tight">1. Hizmetin Kapsamı</h2>
        <p className="text-slate-300 leading-relaxed font-medium">
          CezaSavun.ai, kullanıcıların paylaştığı trafik cezası verilerini analiz ederek Türk hukuk sistemine uygun taslak itiraz dilekçeleri üretir. Her cezanın kendine has teknik detayları olabileceği için AI tarafından üretilen metinlerin nihai hukuki geçerliliği garanti edilmez.
        </p>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-black text-accent tracking-tight">2. Kullanıcı Sorumlulukları</h2>
        <ul className="list-disc list-inside text-slate-300 space-y-4 font-medium pl-4">
          <li>Kullanıcı, sisteme yüklediği belgelerin doğruluğundan sorumludur.</li>
          <li>Uygulama üzerinden alınan dilekçelerin ilgili mahkemelere veya emniyet birimlerine <span className="text-white font-bold">yasal süresi içerisinde</span> (genellikle 15 gün) sunulması kullanıcının takibindedir.</li>
          <li>Sistemin kötüye kullanımı veya yanıltıcı bilgi girişi durumunda üyelik askıya alınabilir.</li>
        </ul>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-black text-accent tracking-tight">3. Ücretlendirme ve İadeler</h2>
        <p className="text-slate-300 leading-relaxed font-medium">
          Dijital bir hizmet sunulduğu ve içerik anında üretildiği için, dilekçe oluşturma işlemi tamamlandıktan sonra ücret iadesi yapılmamaktadır.
        </p>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-black text-accent tracking-tight">4. Değişiklik Hakları</h2>
        <p className="text-slate-300 leading-relaxed font-medium">
          CezaSavun.ai, bu koşulları dilediği zaman güncelleme hakkını saklı tutar. Kullanıcılar siteyi her ziyaret ettiklerinde güncel koşulları kontrol etmekle yükümlüdür.
        </p>
      </section>
    </div>
  );
}
