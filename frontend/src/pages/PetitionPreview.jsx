import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, Scale, CheckCircle2, Loader2 } from 'lucide-react';
import { fetchPetition } from '../utils/api';

export default function PetitionPreview() {
  const { id }    = useParams();
  const navigate  = useNavigate();

  const [petition, setPetition] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchPetition(id);
        if (!data) { setNotFound(true); return; }
        setPetition(data);
      } catch (e) {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handlePrint = () => window.print();

  // ── Loading ──
  if (loading) return (
    <div className="min-h-screen bg-slate-200 flex items-center justify-center font-inter">
      <div className="flex flex-col items-center gap-3">
        <Loader2 size={32} className="animate-spin text-slate-400" />
        <p className="text-slate-500 font-bold text-sm">Dilekçe yükleniyor...</p>
      </div>
    </div>
  );

  // ── Not found ──
  if (notFound || !petition) return (
    <div className="min-h-screen bg-slate-200 flex items-center justify-center font-inter">
      <div className="text-center bg-white rounded-3xl p-12 shadow-xl">
        <p className="font-black text-xl text-slate-800 mb-2">Dilekçe Bulunamadı</p>
        <p className="text-slate-400 mb-6">Bu dilekçe mevcut değil veya erişiminiz yok.</p>
        <button onClick={() => navigate('/dashboard')} className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-bold hover:bg-slate-800 transition-colors">
          Dashboard'a Dön
        </button>
      </div>
    </div>
  );

  const petitionDate = petition.created_at
    ? new Date(petition.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
    : new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });

  const lines = (petition.content || '').split('\n');

  return (
    <div className="font-serif min-h-screen bg-slate-200 print:bg-white">

      {/* ─── Controls Bar (print'te gizlenir) ─── */}
      <div className="print:hidden fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-sm border-b border-slate-700">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <button
            onClick={() => navigate(`/petition/${id}`)}
            className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors font-sans font-bold text-sm group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            Görüntülemeye Dön
          </button>

          <div className="flex items-center gap-2 font-sans">
            <Scale size={16} className="text-sky-400" />
            <span className="font-extrabold text-white text-sm">
              CezaSavun<span className="text-sky-400">.ai</span>
            </span>
            <span className="text-slate-500 text-xs ml-2">Önizleme Modu</span>
          </div>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-sky-500 hover:bg-sky-400 text-white px-6 py-2 rounded-xl font-sans font-bold text-sm transition-colors shadow-lg shadow-sky-900/50"
          >
            <Printer size={16} />
            PDF Olarak Yazdır
          </button>
        </div>
      </div>

      {/* ─── A4 Document ─── */}
      <div className="print:mt-0 pt-20 pb-12 print:py-0 print:min-h-screen">
        <div
          className="max-w-[794px] mx-auto bg-white shadow-2xl print:shadow-none print:max-w-none print:w-full print:mx-0"
          style={{ minHeight: '1123px' }}
        >
          <div className="px-16 py-14 print:px-12 print:py-10">

            {/* ─── Kalite Rozeti (yazdırmada gizlenir) ─── */}
            <div className="flex justify-center mb-6 print:hidden">
              <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-full px-5 py-2">
                <CheckCircle2 className="text-emerald-500" size={16} />
                <span className="font-sans text-xs font-bold text-emerald-600 uppercase tracking-widest">
                  AI Kalite Kontrolü Geçti · Skor: {petition.quality_score || 0}/100
                </span>
              </div>
            </div>

            {/* ─── Başlık ─── */}
            <div className="text-center mb-12 pb-8 border-b-2 border-slate-300">
              <h1 className="text-lg font-black text-slate-900 uppercase tracking-widest mb-1">
                SULH CEZA HAKİMLİĞİ'NE
              </h1>
              <p className="text-sm text-slate-500 font-bold tracking-wide uppercase mb-4">
                Trafik İdari Para Cezasına İtiraz Dilekçesi
              </p>
              <div className="space-y-1">
                {petition.client_name && (
                  <p className="text-slate-700 font-medium text-sm">
                    <strong>BAŞVURUCU:</strong> {petition.client_name.toUpperCase()}
                  </p>
                )}
                {petition.vehicle_plate && (
                  <p className="text-slate-700 font-medium text-sm">
                    <strong>ARAÇ PLAKA NO:</strong> {petition.vehicle_plate}
                  </p>
                )}
                {petition.penalty_code && (
                  <p className="text-slate-700 font-medium text-sm">
                    <strong>KTK MADDESİ:</strong> {petition.penalty_code}
                  </p>
                )}
              </div>
            </div>

            {/* ─── Dilekçe Metni ─── */}
            <div className="space-y-2">
              {lines.map((line, i) => {
                const t = line.trim();
                if (!t) return <div key={i} className="h-3" />;

                if (/^[A-ZÇĞİÖŞÜ\s]{4,}:?$/.test(t)) return (
                  <h2 key={i} className="text-sm font-black text-slate-900 mt-8 mb-2 uppercase tracking-wide">
                    {t}
                  </h2>
                );

                if (/^\d+[\.\)]\s/.test(t)) return (
                  <p key={i} className="text-sm text-slate-700 leading-loose font-medium pl-6">
                    {t}
                  </p>
                );

                return (
                  <p key={i} className="text-sm text-slate-700 leading-loose text-justify">
                    {t}
                  </p>
                );
              })}
            </div>

            {/* ─── İmza Bloğu ─── */}
            <div className="mt-16 pt-8 border-t border-slate-200">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-8">
                <div className="space-y-2">
                  <p className="text-sm text-slate-600">
                    <span className="font-black">Tarih:</span> {petitionDate}
                  </p>
                  <p className="text-sm text-slate-600">
                    <span className="font-black">BAŞVURUCU:</span>{' '}
                    {petition.client_name || '___________________________'}
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-48 border-b-2 border-slate-400 mb-2 h-16" />
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">İmza</p>
                </div>
              </div>

              <p className="text-[10px] text-slate-300 mt-10 text-center font-sans">
                Bu dilekçe CezaSavun.ai tarafından Gemini Flash AI ile otomatik olarak hazırlanmıştır.
                Hukuki danışmanlık yerine geçmez.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Print CSS ─── */}
      <style>{`
        @media print {
          @page { size: A4; margin: 20mm 20mm 25mm 20mm; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>
    </div>
  );
}
