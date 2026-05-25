## 1. Core-API: Analytics Overview Endpoint

- [ ] 1.1 Tambah method `getAnalyticsOverview(userId: string)` di `Kolabri-core-api/src/services/analytics.service.ts` — query semua courses milik user, agregasi quality score rata-rata per kelas, hitung `needsAttention` dan `lastActivity`
- [ ] 1.2 Tambah handler `getAnalyticsOverview` di `Kolabri-core-api/src/controllers/analytics.controller.ts`
- [ ] 1.3 Tambah route `GET /api/analytics/overview` di `Kolabri-core-api/src/routes/analytics.routes.ts`

## 2. Laravel: Overview Controller & Route

- [ ] 2.1 Tambah method `overview()` di `Kolabri-client-app/app/Http/Controllers/Lecturer/AnalyticsController.php` (atau buat controller baru jika belum ada) — fetch dari Core-API `GET /api/analytics/overview`, pass ke Inertia
- [ ] 2.2 Tambah route `GET /lecturer/analytics` → controller method di `Kolabri-client-app/routes/web.php`

## 3. Frontend: Sidebar Flat

- [ ] 3.1 Hapus semua logika sub-items dari `useLecturerNav` di `Kolabri-client-app/resources/js/components/navigation/lecturer-nav.tsx`
- [ ] 3.2 Tambah `'analytics-overview'` ke type `ActivePage` di `lecturer-nav.tsx`
- [ ] 3.3 Update href Analytics di `lecturer-nav.tsx` → selalu mengarah ke route analytics overview baru

## 4. Frontend: Halaman Analytics Overview

- [ ] 4.1 Buat halaman `Kolabri-client-app/resources/js/pages/lecturer/analytics/overview.tsx` — card grid semua kelas, tampilkan quality score rata-rata, jumlah mahasiswa & grup, badge "Perlu Perhatian"
- [ ] 4.2 Pastikan card klik → navigate ke `lecturer.analytics.index.url({ course: courseId })`
- [ ] 4.3 Tambah empty state kalau tidak ada kelas

## 5. Verifikasi

- [ ] 5.1 `lsp_diagnostics` clean di semua file yang diubah
- [ ] 5.2 Sidebar tidak menampilkan sub-items di semua halaman dosen
- [ ] 5.3 Klik Analytics di sidebar → masuk ke halaman overview
- [ ] 5.4 Halaman overview menampilkan card semua kelas dengan data analytics
