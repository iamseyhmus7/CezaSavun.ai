# 🏛️ Trafik Cezası Savunma AI — Sistem Mimarisi Dokümanı

> **Proje Kodu:** `traffic-defense-ai` | **Versiyon:** `2.0-MVP` | **Tarih:** 2026-04-08  
> **Dil:** Python 3.11+ | **Framework:** FastAPI + LangGraph + Qdrant  
> **Lisans:** Proprietary

---

## 📑 İçindekiler

1. [Genel Bakış](#1-genel-bakış)
2. [Teknoloji Yığını](#2-teknoloji-yığını)
3. [Proje Yapısı](#3-proje-yapısı)
4. [Çoklu Ajan Mimarisi](#4-çoklu-ajan-mimarisi)
5. [FastAPI Backend](#5-fastapi-backend)
6. [Web Arayüzü (Frontend)](#6-web-arayüzü)
7. [RAG Pipeline — Qdrant](#7-rag-pipeline--qdrant)
8. [Veritabanı Şeması](#8-veritabanı-şeması)
9. [Pydantic Veri Modelleri](#9-pydantic-veri-modelleri)
10. [LangGraph İş Akışı](#10-langgraph-iş-akışı)
11. [Hata Yönetimi & Fallback](#11-hata-yönetimi--fallback)
12. [Güvenlik & Auth](#12-güvenlik--auth)
13. [Deployment & DevOps](#13-deployment--devops)
14. [Ortam Değişkenleri](#14-ortam-değişkenleri)

---

## 1. Genel Bakış

**Traffic Defense AI**, vatandaşların trafik cezalarına karşı hukuki itiraz dilekçesi oluşturmasını otomatikleştiren, LangGraph tabanlı çoklu ajan sistemidir. Kullanıcı ceza tutanağını (fotoğraf/metin) yükler; sistem OCR ile okur, görsel kanıtları analiz eder, Qdrant vektör veritabanından emsal karar çeker ve Sulh Ceza Hakimliği'ne hitaben profesyonel bir dilekçe üretir.

### Temel Özellikler
- 🔍 **Multimodal OCR** — Ceza tutanağı fotoğrafından otomatik veri çıkarma
- 🖼️ **Görsel Kanıt Analizi** — Radar/park fotoğraflarında hukuki açık tespiti
- 📚 **RAG ile Emsal Karar** — Qdrant üzerinden benzer karar eşleştirme
- 📝 **Otomatik Dilekçe** — KTK madde bazlı profesyonel itiraz metni
- ✅ **Kalite Kontrolü** — Halüsinasyon ve format denetimi (max 3 iterasyon)
- 📄 **PDF/DOCX Export** — İndirilebilir dilekçe çıktısı

---

## 2. Teknoloji Yığını

| Katman | Teknoloji | Versiyon | Amaç |
|--------|-----------|----------|------|
| **LLM** | Gemini 2.0 Flash | latest | Tüm ajan görevleri |
| **Orchestrator** | LangGraph | ≥0.2 | Ajan iş akışı yönetimi |
| **Backend** | FastAPI | ≥0.115 | REST API + WebSocket |
| **Frontend** | HTML/CSS/JS (Vanilla) | — | Kullanıcı arayüzü |
| **Vektör DB** | Qdrant Cloud | ≥1.9 | RAG emsal karar deposu |
| **RDBMS** | PostgreSQL | ≥16 | Kullanıcı/dilekçe verileri |
| **ORM** | SQLAlchemy 2.0 | async | DB erişim katmanı |
| **Embedding** | text-embedding-004 | — | Vektör dönüşümü |
| **Auth** | JWT (python-jose) | — | Token bazlı kimlik doğrulama |
| **PDF Export** | WeasyPrint / ReportLab | — | Dilekçe PDF üretimi |
| **Task Queue** | Celery + Redis | — | Asenkron dilekçe üretimi |
| **Containerization** | Docker + Compose | — | Geliştirme & dağıtım |

---

## 3. Proje Yapısı

```
traffic-defense-ai/
├── AGENTS.md                          # Bu dosya
├── README.md
├── .env.example
├── docker-compose.yml
├── Dockerfile
├── pyproject.toml
├── requirements.txt
│
├── app/                               # 🔹 Ana uygulama paketi
│   ├── __init__.py
│   ├── main.py                        # FastAPI app factory
│   ├── config.py                      # Pydantic Settings
│   │
│   ├── api/                           # 🔹 API Router'lar
│   │   ├── __init__.py
│   │   ├── v1/
│   │   │   ├── __init__.py
│   │   │   ├── router.py              # Ana v1 router
│   │   │   ├── endpoints/
│   │   │   │   ├── auth.py            # Login/Register
│   │   │   │   ├── penalties.py       # Ceza CRUD
│   │   │   │   ├── petitions.py       # Dilekçe üretimi
│   │   │   │   ├── upload.py          # Dosya yükleme
│   │   │   │   └── health.py          # Sağlık kontrolü
│   │   │   └── deps.py               # Dependency injection
│   │
│   ├── agents/                        # 🔹 LangGraph Ajanları
│   │   ├── __init__.py
│   │   ├── graph.py                   # LangGraph workflow tanımı
│   │   ├── state.py                   # Graph State şeması
│   │   ├── classifier.py             # Ajan 1: Sınıflandırıcı
│   │   ├── evidence_analyzer.py      # Ajan 2: Delil İnceleme
│   │   ├── legal_writer.py           # Ajan 3: Hukuki Yazar
│   │   ├── quality_checker.py        # Ajan 4: Kalite Kontrol
│   │   └── prompts/                   # Sistem promptları (YAML)
│   │       ├── classifier.yaml
│   │       ├── evidence_analyzer.yaml
│   │       ├── legal_writer.yaml
│   │       └── quality_checker.yaml
│   │
│   ├── rag/                           # 🔹 RAG Pipeline
│   │   ├── __init__.py
│   │   ├── qdrant_client.py          # Qdrant bağlantı yönetimi
│   │   ├── embeddings.py             # Embedding üretimi
│   │   ├── retriever.py              # Benzer karar arama
│   │   └── data_generator.py         # Sentetik veri üretici
│   │
│   ├── models/                        # 🔹 Pydantic Şemaları
│   │   ├── __init__.py
│   │   ├── penalty.py                # Ceza modelleri
│   │   ├── petition.py               # Dilekçe modelleri
│   │   ├── evidence.py               # Kanıt modelleri
│   │   ├── user.py                   # Kullanıcı modelleri
│   │   └── rag.py                    # RAG sonuç modelleri
│   │
│   ├── db/                            # 🔹 Veritabanı
│   │   ├── __init__.py
│   │   ├── session.py                # Async session factory
│   │   ├── base.py                   # SQLAlchemy Base
│   │   └── tables/                   # ORM tabloları
│   │       ├── user.py
│   │       ├── penalty.py
│   │       └── petition.py
│   │
│   ├── services/                      # 🔹 İş Mantığı Katmanı
│   │   ├── __init__.py
│   │   ├── penalty_service.py
│   │   ├── petition_service.py
│   │   ├── export_service.py         # PDF/DOCX üretimi
│   │   └── auth_service.py
│   │
│   └── core/                          # 🔹 Çapraz Kesim (Cross-cutting)
│       ├── __init__.py
│       ├── security.py               # JWT, hashing
│       ├── logging.py                # Structlog yapılandırması
│       ├── exceptions.py             # Özel exception'lar
│       └── middleware.py             # CORS, rate-limit
│
├── frontend/                          # 🔹 Web Arayüzü
│   ├── index.html
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   ├── app.js                    # Ana uygulama
│   │   ├── api.js                    # API çağrıları
│   │   ├── upload.js                 # Dosya yükleme
│   │   └── petition.js              # Dilekçe görüntüleme
│   └── assets/
│       └── icons/
│
├── scripts/                           # 🔹 Yardımcı Scriptler
│   ├── seed_qdrant.py                # Sentetik veri yükleme
│   ├── migrate.py                    # DB migration
│   └── export_templates.py
│
└── tests/                             # 🔹 Testler
    ├── conftest.py
    ├── test_agents/
    ├── test_api/
    ├── test_rag/
    └── test_services/
```

---

## 4. Çoklu Ajan Mimarisi

### 4.1 Ajan Haritası

| # | Ajan | Girdi | Çıktı | Model |
|---|------|-------|-------|-------|
| 1 | **Classifier** | Fotoğraf / Metin | `PenaltyDetail` JSON | Gemini Flash (Vision) |
| 2 | **Evidence Analyzer** | Kanıt görselleri | `EvidenceAnalysis` JSON | Gemini Flash (Vision) |
| 3 | **Legal Writer** | State + RAG sonuçları | Dilekçe metni (str) | Gemini Flash |
| 4 | **Quality Checker** | Dilekçe taslağı | `QualityReport` JSON | Gemini Flash |

### 4.2 Ajan Sistem Promptları

Tüm promptlar `app/agents/prompts/` altında YAML dosyalarında saklanır. Bu sayede kod değişikliği yapmadan prompt iterasyonu yapılabilir.

#### Ajan 1 — Classifier Agent

```yaml
# app/agents/prompts/classifier.yaml
name: classifier
role: "Uzman Türk Trafik Hukuku OCR Asistanı"
model: gemini-2.0-flash
response_format: application/json
system_prompt: |
  Sen uzman bir Türk Trafik Hukuku asistanısın. Görevin, iletilen trafik
  cezası tutanağından (görsel veya metin) cezanın detaylarını çıkarmaktır.
  
  ## Çıktı Formatı (Strict JSON)
  {
    "penalty_category": "hiz_ihlali | kirmizi_isik | hatali_park | alkol | emniyet_kemeri | diger",
    "penalty_code": "KTK madde numarası (Örn: 51/2-a)",
    "penalty_amount": 0,
    "penalty_date": "YYYY-MM-DD",
    "penalty_location": "İl/İlçe",
    "vehicle_plate": "Plaka numarası",
    "issuing_authority": "Düzenleyen kurum",
    "confidence_score": 0.0,
    "required_evidence": ["İtiraz için gereken ek belge listesi"],
    "raw_ocr_text": "OCR ile okunan ham metin"
  }
  
  ## Kurallar
  - Okunamayan alanları null olarak işaretle
  - confidence_score 0.6 altında ise "low_confidence" flag'i ekle
  - Geçersiz KTK maddesi tespit edersen "invalid_code" flag'i ekle
```

#### Ajan 2 — Evidence Analyzer Agent

```yaml
# app/agents/prompts/evidence_analyzer.yaml
name: evidence_analyzer
role: "Adli Bilişim ve Trafik Kanıt İnceleme Uzmanı"
model: gemini-2.0-flash
response_format: application/json
system_prompt: |
  Sen bir Adli Bilişim ve Trafik İnceleme uzmanısın. Görseli savunma
  avukatı perspektifinden analiz et.
  
  ## Analiz Kontrol Listesi
  1. Plaka okunabilirliği (netlik, açı, ışık)
  2. Trafik tabelaları (eksik, engellenmiş, hasarlı)
  3. Yol koşulları (ıslak zemin, görüş mesafesi)
  4. Radar/kamera teknik uygunluğu
  5. Zaman damgası tutarlılığı
  6. Araç tanımlama kesinliği
  
  ## Çıktı Formatı
  {
    "evidence_strength": 0-100,
    "vulnerabilities": [
      {"type": "tabela_eksik", "description": "...", "severity": "high|medium|low"}
    ],
    "defense_arguments": ["Hukuki argüman cümleleri"],
    "recommended_strategy": "teknik_itiraz | usul_itiraz | maddi_hata",
    "additional_evidence_needed": ["Ek kanıt önerileri"]
  }
```

#### Ajan 3 — Legal Writer Agent

```yaml
# app/agents/prompts/legal_writer.yaml
name: legal_writer
role: "Kıdemli Trafik Hukuku Avukatı"
model: gemini-2.0-flash
system_prompt: |
  Sen tecrübeli bir trafik hukuku avukatısın. Sulh Ceza Hakimliği'ne
  itiraz dilekçesi hazırlayacaksın.
  
  ## Dilekçe Formatı
  1. BAŞLIK: "[İl/İlçe] Nöbetçi Sulh Ceza Hakimliği'ne"
  2. BAŞVURUCU BİLGİLERİ
  3. KONU: Trafik idari para cezasına itiraz
  4. AÇIKLAMALAR (Madde madde, hukuki argümanlar)
  5. EMSAL KARARLAR (RAG'dan gelen referanslar)
  6. HUKUKİ DAYANAK (KTK ilgili maddeleri)
  7. SONUÇ VE TALEP
  
  ## Kurallar
  - Resmi ve profesyonel hukuki dil kullan
  - Emsal kararları "... tarihli, ... sayılı karar" formatında referans ver
  - Sadece dilekçe metnini üret; giriş/çıkış cümlesi ekleme
  - Her argümanı ilgili KTK maddesiyle destekle
```

#### Ajan 4 — Quality Checker Agent

```yaml
# app/agents/prompts/quality_checker.yaml
name: quality_checker
role: "Hukuk Müşaviri — Dilekçe Denetçisi"
model: gemini-2.0-flash
response_format: application/json
system_prompt: |
  Sen kıdemli bir Hukuk Müşavirisin. Yazılmış dilekçeyi denetle.
  
  ## Kontrol Matrisi
  | Kriter              | Ağırlık |
  |---------------------|---------|
  | KTK madde doğruluğu | %30     |
  | Emsal karar uyumu   | %25     |
  | Dilekçe formatı     | %20     |
  | Hukuki tutarlılık   | %15     |
  | Dil ve üslup        | %10     |
  
  ## Çıktı Formatı
  {
    "status": "approved | rejected",
    "quality_score": 0-100,
    "checks": {
      "ktk_accuracy": true,
      "precedent_valid": true,
      "format_correct": true,
      "logic_consistent": true,
      "language_formal": true
    },
    "feedback": ["Düzeltme önerileri listesi"],
    "critical_issues": ["Varsa kritik hatalar"]
  }
```

---

## 5. FastAPI Backend

### 5.1 API Endpoint Haritası

```
Base URL: /api/v1

AUTH
  POST   /auth/register          → Yeni kullanıcı kaydı
  POST   /auth/login             → JWT token al
  POST   /auth/refresh           → Token yenile

PENALTIES (Cezalar)
  POST   /penalties/upload       → Ceza tutanağı yükle (multipart)
  GET    /penalties/              → Kullanıcı cezaları listele
  GET    /penalties/{id}          → Ceza detayı
  DELETE /penalties/{id}          → Ceza sil

PETITIONS (Dilekçeler)
  POST   /petitions/generate     → Dilekçe üretim başlat (async)
  GET    /petitions/{id}/status   → Üretim durumu (WebSocket alternatif)
  GET    /petitions/{id}          → Dilekçe detayı
  GET    /petitions/{id}/download → PDF/DOCX indir
  GET    /petitions/              → Kullanıcının dilekçeleri

HEALTH
  GET    /health                 → Sistem sağlık kontrolü
  GET    /health/agents          → Ajan durumları
```

### 5.2 WebSocket — Gerçek Zamanlı Durum

```
WS /ws/petition/{petition_id}

Mesaj Formatı:
{
  "step": "classifier | evidence | rag_search | writing | quality_check",
  "status": "running | completed | failed",
  "progress": 0-100,
  "message": "Durum açıklaması"
}
```

---

## 6. Web Arayüzü

### 6.1 Sayfa Yapısı

| Sayfa | Açıklama |
|-------|----------|
| `/` | Landing page — Hero section, nasıl çalışır, CTA |
| `/login` | Giriş/Kayıt formu |
| `/dashboard` | Kullanıcı paneli — ceza listesi, istatistikler |
| `/upload` | Ceza yükleme — drag & drop, kamera, manuel giriş |
| `/petition/{id}` | Dilekçe görüntüleme — gerçek zamanlı üretim animasyonu |
| `/petition/{id}/preview` | Dilekçe önizleme & indirme |

### 6.2 Tasarım İlkeleri

- **Tema:** Koyu mod (Dark Mode) — `#0f172a` base, Mavi-Mor gradient aksanlar
- **Font:** Inter (Google Fonts)
- **Layout:** Responsive, mobile-first
- **Animasyonlar:** Dilekçe üretim adımları için step-by-step progress indicator
- **Upload UX:** Drag & drop + kamera erişimi + yapıştır (Ctrl+V)

---

## 7. RAG Pipeline — Qdrant

### 7.1 Koleksiyon Yapısı

```python
# Collection: "legal_precedents"
{
    "vector_size": 768,          # text-embedding-004 boyutu
    "distance": "Cosine",
    "payload_schema": {
        "summary": "str",        # Karar özeti
        "full_text": "str",      # Tam gerekçeli karar
        "penalty_code": "str",   # KTK maddesi (Örn: 51/2-a)
        "cancellation_reason": "str",  # İptal sebebi
        "court": "str",          # Mahkeme adı
        "decision_date": "str",  # Karar tarihi
        "decision_no": "str",    # Esas/Karar No
        "category": "str"        # hiz, kirmizi_isik, park, vb.
    }
}
```

### 7.2 Retrieval Stratejisi

```python
# app/rag/retriever.py — Kavramsal
async def search_precedents(penalty_code: str, context: str, top_k: int = 3):
    """
    1. penalty_code ile Qdrant payload filter (exact match)
    2. context metnini embed et
    3. Filtrelenmiş set üzerinde cosine similarity
    4. top_k en yakın emsal kararı döndür
    """
    filter = Filter(must=[FieldCondition(key="penalty_code", match=penalty_code)])
    query_vector = await embed(context)
    return await qdrant.search(collection="legal_precedents", 
                                query_vector=query_vector,
                                query_filter=filter, limit=top_k)
```

### 7.3 Sentetik Veri Üretimi (MVP)

MVP aşamasında `scripts/seed_qdrant.py` ile Gemini Flash kullanılarak ~50 adet sentetik mahkeme kararı üretilip Qdrant'a yüklenir. Production öncesi gerçek Yargıtay/Sulh Ceza kararları ile değiştirilir.

---

## 8. Veritabanı Şeması

```sql
-- users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- penalties
CREATE TABLE penalties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL,        -- hiz_ihlali, kirmizi_isik, vb.
    penalty_code VARCHAR(20),             -- KTK maddesi
    amount DECIMAL(10,2),
    penalty_date DATE,
    location VARCHAR(255),
    vehicle_plate VARCHAR(20),
    image_path VARCHAR(500),              -- Yüklenen tutanak görseli
    ocr_result JSONB,                     -- Classifier çıktısı
    status VARCHAR(20) DEFAULT 'pending', -- pending, processing, completed
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- petitions
CREATE TABLE petitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    penalty_id UUID REFERENCES penalties(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content TEXT,                          -- Dilekçe metni
    quality_score INTEGER,
    evidence_analysis JSONB,              -- Ajan 2 çıktısı
    rag_references JSONB,                 -- Kullanılan emsal kararlar
    iteration_count INTEGER DEFAULT 0,    -- Revizyon sayısı
    status VARCHAR(20) DEFAULT 'generating', -- generating, approved, failed
    pdf_path VARCHAR(500),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 9. Pydantic Veri Modelleri

```python
# app/models/penalty.py
class PenaltyCategory(str, Enum):
    HIZ_IHLALI = "hiz_ihlali"
    KIRMIZI_ISIK = "kirmizi_isik"
    HATALI_PARK = "hatali_park"
    ALKOL = "alkol"
    EMNIYET_KEMERI = "emniyet_kemeri"
    DIGER = "diger"

class PenaltyDetail(BaseModel):
    penalty_category: PenaltyCategory
    penalty_code: str | None
    penalty_amount: float | None
    penalty_date: date | None
    penalty_location: str | None
    vehicle_plate: str | None
    confidence_score: float = Field(ge=0, le=1)

class EvidenceAnalysis(BaseModel):
    evidence_strength: int = Field(ge=0, le=100)
    vulnerabilities: list[Vulnerability]
    defense_arguments: list[str]
    recommended_strategy: Literal["teknik_itiraz", "usul_itiraz", "maddi_hata"]

class QualityReport(BaseModel):
    status: Literal["approved", "rejected"]
    quality_score: int = Field(ge=0, le=100)
    feedback: list[str] = []
    critical_issues: list[str] = []

class PetitionResponse(BaseModel):
    id: UUID
    content: str
    quality_score: int
    status: str
    download_url: str | None
```

---

## 10. LangGraph İş Akışı

```
┌─────────────────────────────────────────────────────┐
│                   KULLANICI INPUT                    │
│              (Görüntü / Metin / Her İkisi)          │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
              ┌────────────────┐
              │  1. CLASSIFIER │──── Confidence < 0.6 ──→ ❌ Retry / Manual
              │    (OCR+Parse) │
              └───────┬────────┘
                      │ PenaltyDetail
                      ▼
          ┌───────────────────────┐
          │  2. EVIDENCE ANALYZER │──── No Image ──→ ⚡ Skip (usul itirazı)
          │   (Vision + Analiz)   │
          └──────────┬────────────┘
                     │ EvidenceAnalysis
                     ▼
          ┌───────────────────────┐
          │  3. QDRANT RAG SEARCH │
          │  (Emsal Karar Çekme)  │
          └──────────┬────────────┘
                     │ List[Precedent]
                     ▼
          ┌───────────────────────┐
     ┌──→ │  4. LEGAL WRITER     │
     │    │  (Dilekçe Yazımı)    │
     │    └──────────┬────────────┘
     │               │ draft_text
     │               ▼
     │    ┌───────────────────────┐
     │    │  5. QUALITY CHECKER   │
     │    │  (Denetim + Skor)     │
     │    └──────────┬────────────┘
     │               │
     │       ┌───────┴───────┐
     │       │               │
     │   REJECTED        APPROVED
     │   (iter < 3)      (score ≥ 70)
     │       │               │
     └───────┘               ▼
                   ┌──────────────────┐
                   │  PDF/DOCX EXPORT │
                   │  + DB Kayıt      │
                   └──────────────────┘
```

### Döngü Limiti (Circuit Breaker)
- **Max İterasyon:** 3 tur
- 3 turda onay alınamazsa → `petition_templates` tablosundan statik taslak sunulur
- Tüm ara sonuçlar `petitions.evidence_analysis` ve `petitions.rag_references` JSONB alanlarına kaydedilir

---

## 11. Hata Yönetimi & Fallback

| Senaryo | Fallback Stratejisi |
|---------|---------------------|
| OCR okunamıyor | Kullanıcıya manuel giriş formu sun |
| Vision başarısız | Genel "usulden itiraz" argümanına geç |
| Qdrant erişilemez | Yerel cache'ten en son çekilen kararları kullan |
| Gemini API hatası | 3 retry (exponential backoff), sonra kuyrukla |
| Quality 3x rejected | Statik template + kullanıcı uyarısı |
| PDF üretim hatası | Düz metin olarak indirilsin |

---

## 12. Güvenlik & Auth

- **JWT Token:** Access (15 dk) + Refresh (7 gün)
- **Şifreleme:** bcrypt (passlib)
- **Rate Limiting:** 10 req/dk (dilekçe üretimi), 60 req/dk (genel)
- **CORS:** Sadece izin verilen origin'ler
- **Input Sanitization:** Tüm kullanıcı girdileri sanitize edilir
- **Dosya Yükleme:** Max 10MB, sadece image/jpeg, image/png, application/pdf

---

## 13. Deployment & DevOps

```yaml
# docker-compose.yml (Geliştirme)
services:
  api:
    build: .
    ports: ["8000:8000"]
    env_file: .env
    depends_on: [db, redis]
    
  db:
    image: postgres:16-alpine
    volumes: [pgdata:/var/lib/postgresql/data]
    
  redis:
    image: redis:7-alpine
    
  # Qdrant Cloud kullanılıyor (harici servis)
```

---

## 14. Ortam Değişkenleri

```env
# .env.example
# --- App ---
APP_NAME=traffic-defense-ai
APP_ENV=development    # development | staging | production
SECRET_KEY=change-me-in-production
DEBUG=true

# --- Database ---
DATABASE_URL=postgresql+asyncpg://user:pass@localhost:5432/traffic_defense

# --- Gemini ---
GOOGLE_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-2.0-flash

# --- Qdrant ---
QDRANT_URL=https://your-cluster.qdrant.io
QDRANT_API_KEY=your-qdrant-api-key
QDRANT_COLLECTION=legal_precedents

# --- Redis ---
REDIS_URL=redis://localhost:6379/0

# --- JWT ---
JWT_SECRET=your-jwt-secret
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=15
JWT_REFRESH_TOKEN_EXPIRE_DAYS=7
```

---

> **📌 Sonraki Adımlar:** Bu doküman projenin temel mimari blueprintidir. Geliştirme sırası:
> 1. `pyproject.toml` + dependency kurulumu
> 2. `scripts/seed_qdrant.py` — Sentetik veri üretimi  
> 3. `app/agents/` — LangGraph iş akışı  
> 4. `app/api/` — FastAPI endpoint'leri  
> 5. `frontend/` — Web arayüzü  
> 6. Entegrasyon testleri