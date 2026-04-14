/**
 * api.js — Merkezi API yardımcısı
 * 
 * Tüm isteklere otomatik olarak:
 *  - Authorization: Bearer <token> header ekler
 *  - 401 gelirse kullanıcıyı login sayfasına yönlendirir
 */

const BASE = "/api/v1";

export async function apiFetch(path, options = {}) {
  const token = localStorage.getItem("token");

  const headers = {
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  // FormData ise Content-Type otomatik ayarlanır — manuel ekleme!
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${BASE}${path}`, {
    ...options,
    headers,
  });

  // Token süresi dolmuşsa veya geçersizse → login'e yönlendir
  if (response.status === 401) {
    localStorage.removeItem("token");
    localStorage.removeItem("user_email");
    window.location.href = "/auth/login";
    throw new Error("Oturum süresi doldu. Lütfen tekrar giriş yapın.");
  }

  return response;
}

/** Kullanıcı profilini DB'den çek */
export async function fetchMe() {
  const res = await apiFetch("/auth/me");
  if (!res.ok) throw new Error("Kullanıcı bilgisi alınamadı.");
  return res.json(); // { id, name, surname, email, is_verified, created_at }
}

/** Dilekçe geçmişini DB'den çek */
export async function fetchPetitions() {
  const res = await apiFetch("/petitions/");
  if (!res.ok) throw new Error("Dilekçe listesi alınamadı.");
  return res.json(); // Array<PetitionListItem>
}

/** Tek dilekçeyi DB'den çek */
export async function fetchPetition(id) {
  const res = await apiFetch(`/petitions/${id}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Dilekçe alınamadı.");
  return res.json(); // PetitionDetail
}

/** Dilekçe üretimi — multipart form (file + client_name) */
export async function generatePetition(file, clientName = "") {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("client_name", clientName);

  const res = await apiFetch("/petitions/generate", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "AI analizi başarısız.");
  }
  return res.json(); // { petition_id, status, draft_petition, quality_score, errors }
}
