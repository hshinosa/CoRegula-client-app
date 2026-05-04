# KOL-49 Matriks Kompatibilitas Browser

## Cakupan

- Browser: Chrome, Edge, Firefox
- Viewport: Desktop, Tablet Responsif, Mobile Responsif
- Halaman: `resources/js/pages/student/chat/room.tsx`, `resources/js/pages/student/chat/index.tsx`

## Keterangan Status

- `PASS` = berjalan sesuai harapan
- `FAIL` = rusak / tidak dapat digunakan secara normal
- `WARN` = berjalan, tetapi ada perbedaan perilaku atau UX yang perlu dicatat
- `N/A` = belum relevan atau belum diuji pada skenario tersebut

## Matriks

| Area | Skenario | Browser | Viewport | Status | Bukti / Catatan | Severity | Tindak Lanjut yang Disarankan |
|---|---|---|---|---|---|---|---|
| Entry | Membuka halaman chat dari alur student | Chrome | Desktop | PASS | Validasi manual oleh pemilik proyek mengonfirmasi bahwa alur student dapat join dengan invite code, masuk ke group space yang benar, dan mencapai chat room di environment aktif. Blocker lama dari sesi controller sebelumnya ternyata false negative. | Informational | Jadikan baseline dan cek ulang pada regresi berikutnya. |
| Entry | Membuka halaman chat dari alur student | Edge | Desktop | N/A | Belum dibaseline ulang pada sesi ini. Validasi manual mengonfirmasi alur inti berjalan di environment aktif, tetapi bukti khusus Edge belum direkam terpisah. | N/A | Ulangi skenario entry yang sama di Edge pada regresi cross-browser berikutnya. |
| Entry | Membuka halaman chat dari alur student | Firefox | Desktop | N/A | Belum dibaseline ulang pada sesi ini. Validasi manual mengonfirmasi alur inti berjalan di environment aktif, tetapi bukti khusus Firefox belum direkam terpisah. | N/A | Ulangi skenario entry yang sama di Firefox pada regresi cross-browser berikutnya. |
| Entry | Membuka halaman chat dari alur student | Chrome | Tablet | N/A | Akses inti student/chat sudah terkonfirmasi secara manual di environment aktif, tetapi validasi end-to-end khusus tablet belum direkam ulang pada sesi ini. | N/A | Ulangi khusus pada viewport tablet di regresi berikutnya. |
| Entry | Membuka halaman chat dari alur student | Chrome | Mobile | N/A | Viewport mobile untuk entry langsung ke halaman chat belum dijalankan pada sesi ini. Alur utama dianggap berjalan, tetapi bukti khusus mobile belum direkam. | N/A | Ulangi pada regresi responsif berikutnya. |
| Rendering | Empty state tampil tanpa kerusakan layout | Chrome | Desktop | PASS | Empty state `/student/courses` dalam kondisi login tampil stabil dengan heading `Mata Kuliah Saya`, kartu `Belum ada mata kuliah`, dan aksi `Gabung Mata Kuliah` yang terlihat serta dapat digunakan. | Informational | Jadikan baseline untuk regresi empty state student saat login. |
| Rendering | Modal join course terbuka dan tetap terbaca | Chrome | Desktop | PASS | Modal `Gabung Mata Kuliah` terbuka dengan baik, menampilkan heading, helper text, textbox join code, serta aksi `Batal` / `Gabung` yang jelas. | Informational | Jadikan baseline untuk regresi interaksi modal student. |
| Rendering | Timeline chat aktif tampil dengan benar | Chrome | Desktop | PASS | Validasi manual oleh pemilik proyek mengonfirmasi bahwa chat room dapat dimasuki dan digunakan di environment aktif, sehingga timeline chat utama dianggap dapat diakses dan dipakai dengan baik. | Informational | Jadikan baseline dan tambahkan screenshot pada regresi formal berikutnya. |
| Sending | Mengirim pesan teks biasa | Chrome | Desktop | PASS | Validasi manual oleh pemilik proyek menunjukkan bahwa alur utama kelas-ke-chat dapat digunakan di environment aktif, sehingga pengiriman pesan teks biasa dianggap berjalan untuk baseline saat ini. | Informational | Ambil ulang screenshot/log pengiriman eksplisit pada siklus regresi berikutnya. |
| Sending | Mengirim pesan teks biasa | Edge | Desktop | N/A | Bukti khusus alur kirim di Edge belum direkam pada sesi ini. Alur fungsional sudah tervalidasi manual, tetapi belum dibaseline ulang di Edge. | N/A | Ulangi di Edge pada regresi cross-browser berikutnya. |
| Sending | Mengirim pesan teks biasa | Firefox | Desktop | N/A | Bukti khusus alur kirim di Firefox belum direkam pada sesi ini. Alur fungsional sudah tervalidasi manual, tetapi belum dibaseline ulang di Firefox. | N/A | Ulangi di Firefox pada regresi cross-browser berikutnya. |
| Optimistic UI | `Mengirim...` muncul segera setelah kirim | Chrome | Desktop | N/A | Status pending optimistic belum direkam ulang secara eksplisit pada sesi ini, meskipun alur chat utama sudah tervalidasi manual. | N/A | Ulangi setelah sesi baseline chat formal dijalankan kembali. |
| Optimistic UI | Reconcile berhasil menghapus status pending | Chrome | Desktop | N/A | Perilaku reconcile belum direkam ulang secara eksplisit pada sesi ini. | N/A | Ulangi pada baseline chat berikutnya. |
| Retry | Pesan gagal tetap terlihat | Chrome | Desktop | N/A | UI gagal kirim belum direproduksi ulang secara eksplisit pada sesi ini. | N/A | Ulangi setelah skenario gagal kirim yang terkontrol disiapkan. |
| Retry | `Coba lagi` muncul untuk pesan gagal | Chrome | Desktop | N/A | Aksi retry belum diuji ulang secara eksplisit pada sesi ini. | N/A | Ulangi pada baseline chat berikutnya. |
| Retry | Retry mempertahankan isi pesan | Chrome | Desktop | N/A | Pelestarian isi saat retry belum diuji ulang secara eksplisit. | N/A | Ulangi pada baseline chat berikutnya. |
| Reply | Preview reply tampil dengan benar | Chrome | Desktop | N/A | Fitur reply belum direkam ulang secara eksplisit pada sesi ini, walaupun alur utama chat sudah tervalidasi manual. | N/A | Ulangi pada baseline chat berikutnya. |
| Attachment | Preview / kirim attachment berjalan benar | Chrome | Desktop | N/A | Alur attachment belum direkam ulang secara eksplisit pada sesi ini. | N/A | Ulangi pada baseline chat berikutnya. |
| Mention | Alur mention tetap sesuai saat kirim | Chrome | Desktop | N/A | Alur mention belum direkam ulang secara eksplisit pada sesi ini. | N/A | Ulangi pada baseline chat berikutnya. |
| Scroll | Timeline panjang tetap terbaca dan usable | Chrome | Desktop | N/A | Perilaku timeline panjang belum dievaluasi ulang secara eksplisit. | N/A | Ulangi pada baseline chat berikutnya. |
| Responsive | Compose area tetap dapat dijangkau | Chrome | Tablet | WARN | Perilaku responsif tablet pada alur student yang dapat dijangkau masih usable, tetapi area compose chat yang sebenarnya belum direkam ulang manual pada tablet di sesi ini. | Minor | Tambahkan pengecekan compose chat khusus tablet pada regresi berikutnya. |
| Responsive | Compose area tetap dapat dijangkau | Chrome | Mobile | N/A | Validasi compose area di mobile belum dijalankan pada sesi ini. | N/A | Ulangi setelah baseline desktop/tablet diperkuat. |
| Responsive | Timeline dan tombol aksi tidak saling overlap | Edge | Tablet | N/A | Viewport tablet pada Edge belum dijalankan pada sesi ini. | N/A | Ulangi pada regresi lintas browser berikutnya. |
| Responsive | Timeline dan tombol aksi tidak saling overlap | Firefox | Mobile | N/A | Viewport mobile pada Firefox belum dijalankan pada sesi ini. | N/A | Ulangi pada regresi lintas browser berikutnya. |
| Connection | Perilaku UI tetap mudah dipahami saat disconnect/reconnect | Chrome | Desktop | N/A | Perilaku disconnect/reconnect belum diuji secara eksplisit pada sesi ini. | N/A | Ulangi pada baseline chat berikutnya. |
