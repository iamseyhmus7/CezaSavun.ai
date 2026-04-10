import React from 'react';

export default function KVKK() {
  return (
    <div className="space-y-12">
      <header>
        <h1 className="text-4xl font-black text-white mb-4 tracking-tight">KVKK Aydınlatma Metni</h1>
        <p className="text-slate-400 font-bold">6698 Sayılı Kişisel Verilerin Korunması Kanunu Kapsamında Bilgilendirme</p>
      </header>

      <section className="space-y-6">
        <h2 className="text-2xl font-black text-accent tracking-tight">1. Veri Sorumlusu</h2>
        <p className="text-slate-300 leading-relaxed font-medium">
          CezaSavun.ai ("Şirket"), kullanıcılarının temel hak ve özgürlüklerine saygı göstererek verilerinin güvenliğini sağlamayı öncelik edinmiştir. Bu metin, platformumuzu kullanan bireylerin verilerinin nasıl işlendiği konusunda şeffaflık sağlamak amacıyla hazırlanmıştır.
        </p>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-black text-accent tracking-tight">2. İşlenen Veri Türleri ve Yapay Zeka (AI) Süreçleri</h2>
        <p className="text-slate-300 leading-relaxed font-medium">
          Sistemimize yüklediğiniz trafik cezası tutanakları ve fotoğrafları;
        </p>
        <ul className="list-disc list-inside text-slate-300 space-y-4 font-medium pl-4">
          <li><span className="text-white font-bold">OCR (Optik Karakter Tanıma):</span> Görsellerdeki metinleri dijital veriye dönüştürmek için işlenir.</li>
          <li><span className="text-white font-bold">Kimlik ve Araç Bilgileri:</span> Ad-Soyad, Plaka, TC Kimlik No gibi veriler dilekçe üretimi için AI modelleri tarafından analiz edilir.</li>
          <li><span className="text-white font-bold">Mahkeme Kararları:</span> Verileriniz, anonimleştirilerek Qdrant vektör veritabanımızdaki emsal kararlarla eşleştirilir.</li>
        </ul>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-black text-accent tracking-tight">3. Verilerin Saklanma Süresi</h2>
        <p className="text-slate-300 leading-relaxed font-medium">
          CezaSavun.ai, "minimal veri" ilkesini benimser. Dilekçe üretim aşaması bittiğinde ve kullanıcı dosyayı indirdiğinde, yüklenen ham görseller <span className="text-emerald-400 font-black">24 saat içerisinde</span> sunucularımızdan kalıcı olarak silinir. Üretilen dilekçeler, kullanıcının talebi üzerine kullanıcı tarafından silinene kadar şifreli olarak saklanır.
        </p>
      </section>

      <section className="space-y-6 border-l-4 border-accent pl-8 py-4 bg-accent/5 rounded-r-3xl">
        <h2 className="text-xl font-black text-white tracking-tight">Haklarınız</h2>
        <p className="text-slate-400 text-sm font-bold leading-relaxed">
          6698 sayılı Kanun’un 11. maddesi uyarınca; verilerinizin işlenip işlenmediğini öğrenme, yanlış işlenmişse düzeltilmesini isteme ve verilerinizin silinmesini talep etme hakkına sahipsiniz. Taleplerinizi hukuk@cezasavun.ai adresine iletebilirsiniz.
        </p>
      </section>
    </div>
  );
}
