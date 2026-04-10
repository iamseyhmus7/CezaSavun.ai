import React from 'react';

export default function Privacy() {
  return (
    <div className="space-y-12">
      <header>
        <h1 className="text-4xl font-black text-white mb-4 tracking-tight">Gizlilik Politikası</h1>
        <p className="text-slate-400 font-bold">Verilerinizin Güvenliği ve Gizliliği Hakkında</p>
      </header>

      <section className="space-y-6">
        <h2 className="text-2xl font-black text-accent tracking-tight">1. Bilgi Toplama ve Kullanımı</h2>
        <p className="text-slate-300 leading-relaxed font-medium">
          CezaSavun.ai, kullanıcı deneyimini iyileştirmek ve sadece talep edilen hizmeti (dilekçe üretimi) sunmak amacıyla veri toplar. Toplanan veriler, doğrudan sizin tarafınızdan sağlanan (yüklenen belgeler, plaka bilgileri) ve otomatik olarak toplanan (çerezler, IP adresi) verilerden oluşur.
        </p>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-black text-accent tracking-tight">2. Üçüncü Taraf AI API Paylaşımları</h2>
        <p className="text-slate-300 leading-relaxed font-medium">
          Dilekçeleriniz, Google Gemini gibi ileri seviye yapay zeka modelleri kullanılarak oluşturulur. Bu süreçte;
        </p>
        <div className="bg-white/5 p-6 rounded-[24px] border border-white/10 space-y-4">
          <p className="text-sm font-bold text-sky-400 uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-sky-400" /> Anonimleştirme Protokolü
          </p>
          <p className="text-slate-300 text-sm font-medium leading-relaxed">
            AI modellerine gönderilen veriler, kimlik bilgilerinden arındırılarak (anonimleştirilerek) gönderilir. API sağlayıcıları bu verileri modellerini eğitmek için kullanmaz, sadece anlık üretim için işlerler.
          </p>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-black text-accent tracking-tight">3. Çerezler (Cookies)</h2>
        <p className="text-slate-300 leading-relaxed font-medium">
          Web sitemiz, oturum yönetimi ve performans analizi için temel çerezleri kullanır. Reklam amaçlı üçüncü taraf çerezleri kesinlikle kullanılmamaktadır.
        </p>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-black text-accent tracking-tight">4. Güvenlik</h2>
        <p className="text-slate-300 leading-relaxed font-medium">
          Sunucularımız 256-bit SSL sertifikası ile korunmaktadır. Tüm veri tabanı erişimleri sıkı yetkilendirme prosedürlerine tabidir.
        </p>
      </section>
    </div>
  );
}
