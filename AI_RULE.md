# AI\_RULE.md

## Aturan Wajib untuk AI Coding Agent — Proyek SIM-KPTA

Dokumen ini adalah aturan kerja yang **mengikat** untuk setiap AI (Claude Code, Cursor, Copilot, atau lainnya) yang menulis kode di repository ini. Rujukan utama seluruh keputusan teknis adalah `Blueprint_SIMKPTA_Final.md`. Dokumen ini **tidak menggantikan** blueprint — dokumen ini mengatur *cara* AI bekerja di dalam batasan yang sudah ditetapkan blueprint.

Jika ada instruksi dari user yang bertentangan dengan blueprint atau dokumen ini, AI **wajib berhenti dan menanyakan konfirmasi**, bukan langsung mengeksekusi.

---

## 1. Prinsip Umum

1. **Blueprint adalah sumber kebenaran tunggal.** Sebelum menulis kode apa pun (tabel, endpoint, permission, komponen), AI wajib mengecek apakah hal tersebut sudah didefinisikan di `Blueprint_SIMKPTA_Final.md`. Jika belum ada, AI **tidak boleh mengarang/mengasumsikan** — AI harus menyampaikan bahwa spesifikasi belum tersedia dan meminta klarifikasi, atau mengajukan proposal yang eksplisit ditandai sebagai usulan (bukan bagian resmi blueprint) untuk disetujui dulu.
2. **Dilarang berimprovisasi nama entitas.** Nama tabel, kolom, permission, route, dan Redux slice **harus persis sama** dengan yang tertulis di blueprint (bagian 2, 6, 7, 9). Jangan membuat variasi seperti `mahasiswas` vs `mahasiswa`, `mata_kuliah` yang tidak ada di blueprint, dsb.
3. **Satu perubahan, satu tujuan.** Jangan menambahkan fitur, tabel, atau refactor besar yang tidak diminta dalam satu task yang sama. Jika AI melihat peluang perbaikan di luar scope task, laporkan sebagai saran terpisah, jangan langsung dieksekusi.
4. **Tidak ada logic penting yang hanya ada di frontend.** Semua validasi/otorisasi yang krusial (permission, kepemilikan data, jumlah anggota kelompok, dsb.) wajib ditegakkan di backend. Validasi di frontend hanya untuk UX.
5. **Konsistensi bahasa:** nama tabel, kolom, dan variabel domain bisnis memakai Bahasa Indonesia sesuai blueprint (`kelompok_kp`, `dosen_pembimbing`, dst). Nama variabel teknis umum (loop, helper, dsb.) boleh Bahasa Inggris. Jangan mencampur gaya penamaan dalam satu entitas yang sama.
6. **Kalau ragu, berhenti dan bertanya** — jangan menebak struktur data, endpoint, atau alur bisnis yang tidak eksplisit ada di blueprint.

---

## 2. Struktur Folder & Penempatan File

### 2.1 Backend (Laravel 12)

Struktur mengikuti konvensi standar Laravel, dengan penambahan berikut:

```
app/
├── Models/                      # 1 model = 1 tabel, PascalCase singular
│   ├── KelompokKp.php
│   ├── TugasAkhir.php
│   ├── PengaturanAplikasi.php
│   └── ...
├── Http/
│   ├── Controllers/
│   │   ├── Api/
│   │   │   ├── KpController.php
│   │   │   ├── TaController.php
│   │   │   ├── PengaturanController.php
│   │   │   └── ...
│   ├── Requests/                # Form Request per aksi, bukan validasi inline di controller
│   │   ├── Kp/StoreKelompokRequest.php
│   │   ├── Kp/VerifikasiKelompokRequest.php
│   │   └── ...
│   └── Resources/                # API Resource untuk shape response, wajib dipakai — jangan return Model mentah
│       ├── KelompokKpResource.php
│       └── ...
├── Policies/                     # 1 policy per model yang butuh cek kepemilikan/relasi
│   ├── KelompokKpPolicy.php
│   └── TugasAkhirPolicy.php
├── Services/                     # business logic kompleks yang tidak pantas di controller
│   ├── Kp/PembentukanKelompokService.php
│   └── Pengaturan/PengaturanService.php   # implementasi Pengaturan::get()/set() sesuai bagian 6.2 blueprint
└── Support/                      # helper/utility class kecil lintas modul

```

**Aturan tambahan backend:**

- Controller **tidak boleh** berisi query builder kompleks langsung. Query kompleks masuk ke Model (scope) atau Service.
- Setiap endpoint yang butuh permission **wajib** memakai middleware `permission:` sesuai nama persis di tabel bagian 2 blueprint — dilarang cek role/permission manual dengan if-else string di controller.
- Tabel polymorphic (`dosen_pembimbing`, `bimbingan`, `laporan`, dst — lihat bagian 7.4 blueprint) memakai relasi `morphTo`/`morphMany` Eloquent standar. Jangan buat tabel duplikat per modul (mis. `bimbingan_kp` terpisah dari `bimbingan_ta`) — itu bertentangan dengan desain polymorphic yang sudah ditetapkan.
- Migration baru wajib punya nama file dengan urutan waktu yang benar dan **tidak boleh mengedit migration lama yang sudah pernah dijalankan** di branch utama — buat migration baru untuk perubahan skema.

### 2.2 Frontend (React + Vite)

Struktur ini **final** dan sudah ditetapkan di blueprint bagian 3.2 — AI dilarang mengubah pola dasarnya (misalnya membuat folder per role):

```
resources/js/
├── app.jsx
├── main.jsx
├── router/
│   ├── AppRouter.jsx
│   └── ProtectedRoute.jsx
├── store/slices/
│   ├── authSlice.js
│   ├── settingsSlice.js
│   └── notifSlice.js
├── config/
│   └── menuConfig.js             # SATU-SATUNYA tempat pendaftaran menu. Dilarang membuat sumber menu lain.
├── layouts/
│   └── AppShell.jsx
├── modules/
│   ├── kp/
│   │   ├── pages/
│   │   ├── components/
│   │   └── api/
│   ├── ta/
│   ├── master-data/
│   ├── pengaturan/
│   └── shared/
└── components/ui/                # komponen generik lintas modul (Button, Modal, Table, dst — tanpa business logic)

```

**Aturan tambahan frontend:**

- Halaman/komponen ditempatkan di dalam `modules/<domain>/`, **bukan** `modules/<role>/`. Jika sebuah komponen dipakai lebih dari satu modul, naikkan ke `modules/shared/` atau `components/ui/` — jangan diduplikasi.
- Setiap route baru wajib didaftarkan di `AppRouter.jsx` dan dibungkus `ProtectedRoute` dengan permission yang sesuai, serta didaftarkan di `menuConfig.js` jika perlu tampil di sidebar.
- Pengecekan role/permission di komponen **hanya** boleh lewat `useSelector(s => s.auth.permissions)`, jangan hardcode nama role (`if (user.role === 'admin')`) di mana pun.
- Pemanggilan API dari modul memakai file `api/` di dalam modul masing-masing (mis. `modules/kp/api/kpApi.js`), bukan fetch langsung di dalam komponen halaman.

### 2.3 Larangan Struktural

AI **dilarang**:

- Membuat folder `pages/admin`, `pages/dosen`, `pages/mahasiswa`, atau sejenisnya (folder per role).
- Membuat tabel/model baru yang bukan turunan dari struktur bagian 7 blueprint tanpa persetujuan eksplisit.
- Menyimpan file upload (logo, favicon, dokumen) di `public/` lokal — semua file storage wajib lewat driver S3-compatible sesuai blueprint bagian 1 dan 6.4.
- Membuat sistem konfigurasi/setting baru di luar pola key-value `pengaturan_aplikasi` (bagian 6.2) untuk kebutuhan setting sejenis.

---

## 3. Konvensi Penamaan

| Elemen | Konvensi | Contoh |
|:---|:---|:---|
| Nama tabel | snake\_case, plural untuk data mandiri, singular untuk pivot/atribut | `kelompok_kp`, `dosen_pembimbing` |
| Nama model | PascalCase singular | `KelompokKp`, `DosenPembimbing` |
| Nama permission | `domain.aksi` atau `domain.sub-domain.aksi`, huruf kecil, dash untuk multi-kata | `kp.verifikasi-pendaftaran`, `ta.nilai.input` |
| Nama route API | `/api/{domain}/{resource}` | `/api/kp/kelompok`, `/api/pengaturan/public` |
| Nama Redux slice | camelCase + `Slice` | `authSlice`, `settingsSlice` |
| Nama komponen React | PascalCase | `PengaturanUmum.jsx`, `AppShell.jsx` |
| Nama file Form Request | `{Aksi}{Entity}Request` | `StoreKelompokRequest` |

Permission baru **wajib** mengikuti pola `domain.aksi` yang sudah dipakai di blueprint bagian 2 — jangan membuat pola penamaan permission baru yang berbeda gaya.

---

## 4. Aturan Database

1. Semua tabel baru wajib tercermin dulu di blueprint (bagian 7) sebelum migration ditulis. Jika kebutuhan tabel muncul saat development dan belum ada di blueprint, **update blueprint dulu** (via proposal ke user), baru buat migration.
2. Kolom `status` pada entitas bertransisi (kelompok KP, TA, dokumen, dsb.) memakai enum/string sesuai diagram status yang tertulis di blueprint (bagian 4.11, 5) — jangan menambah state baru tanpa memperbarui diagram tersebut.
3. Perubahan yang bersifat konfigurasi (bukan struktur data inti) diarahkan ke tabel `pengaturan_aplikasi`, bukan menambah kolom baru di tabel lain.
4. Audit trail wajib dicatat lewat `status_histories` (perubahan status) dan `log_aktivitas` (aksi umum) yang sudah ada — jangan membuat mekanisme logging baru yang duplikatif.
5. Foreign key wajib memakai constraint database (`->constrained()`), bukan hanya validasi aplikasi, kecuali untuk relasi polymorphic yang memang tidak didukung constraint native.

---

## 5. Aturan API

1. Response API konsisten memakai API Resource Laravel — jangan return array/model mentah.
2. Format response sukses dan error mengikuti struktur seragam di seluruh endpoint (disepakati sekali di awal project, lalu dipakai konsisten — AI tidak boleh membuat format response baru per endpoint).
3. Endpoint publik (tanpa auth) hanya untuk yang eksplisit ditandai publik di blueprint (contoh: `GET /api/pengaturan/public`). Endpoint lain wajib melalui Sanctum + middleware permission.
4. Endpoint baru yang belum ada di blueprint bagian 9 wajib ditambahkan ke dokumen blueprint (update dokumen) begitu dibuat, supaya blueprint tetap jadi acuan yang akurat — bukan didiamkan hanya ada di kode.

---

## 6. Aturan State Management (Redux Toolkit) & Persistensi Halaman

**Prinsip:** data yang sudah pernah dimuat ke Redux store dianggap tetap tersedia selama sesi aplikasi berjalan (SPA tidak full-reload). Berpindah halaman lalu kembali lagi **tidak boleh** memicu tampilan loading/skeleton ulang jika data yang relevan sudah ada di store dan belum ditandai stale/invalid.

### 6.1 Gunakan RTK Query untuk Semua Data Fetching

- Fetching data dari API **wajib** lewat RTK Query (`createApi` + `useXxxQuery` hooks), bukan `useEffect` + `fetch`/`axios` manual di komponen. RTK Query menyimpan cache di level store (bukan di level komponen), sehingga saat komponen unmount lalu mount lagi (pindah halaman lalu kembali), data cache tetap tersedia tanpa request baru selama masih dalam masa cache.
- Setiap endpoint API di RTK Query wajib didefinisikan sekali di `modules/<domain>/api/<domain>Api.js`, tidak boleh duplikat definisi endpoint yang sama di modul lain.
- Set `keepUnusedDataFor` secara eksplisit per jenis data, jangan biarkan default begitu saja tanpa pertimbangan:
  - Data master/referensi yang jarang berubah (prodi, periode akademik, tema KP, dsb.) → cache lama, misalnya `keepUnusedDataFor: 600` (10 menit) atau lebih.
  - Data transaksional yang sering berubah (status kelompok, notifikasi) → cache lebih pendek, tapi tetap tidak nol, agar navigasi bolak-balik dalam waktu singkat tidak refetch.
  - Data sesi/pengaturan aplikasi (`settingsSlice`: app\_name, logo, dst.) → dimuat sekali di awal aplikasi lewat `authSlice`/`settingsSlice`, **bukan** di-refetch tiap kali halaman terkait dimount.

### 6.2 Perbedaan `isLoading` vs `isFetching` — Wajib Dipahami dan Dipakai dengan Benar

- `isLoading` (true hanya saat **belum ada data sama sekali** di cache) → boleh dipakai untuk menampilkan skeleton/spinner, karena memang belum ada apa pun untuk ditampilkan.
- `isFetching` (true setiap kali request berjalan, termasuk saat data lama sudah ada dan sedang di-refresh di background) → **dilarang** dipakai untuk menampilkan skeleton penuh yang mengganti konten. Kalau perlu indikator, gunakan indikator kecil non-blocking (misalnya small spinner di pojok), bukan skeleton yang menutupi halaman.
- Pola komponen yang benar: 
  ```
  const { data, isLoading, isFetching } = useGetKelompokQuery(periodeId);if (isLoading) return <Skeleton />;      // hanya saat benar-benar belum ada datareturn <KelompokTable data={data} refreshing={isFetching} />; // data lama tetap tampil walau sedang refetch

  ```
- AI dilarang menulis kondisi `if (isLoading || isFetching) return <Skeleton />` — pola ini yang menyebabkan skeleton muncul ulang setiap kali user kembali ke halaman.

### 6.3 Larangan Reset State Saat Unmount

- Komponen halaman **dilarang** mereset slice/cache terkait di cleanup function `useEffect` (`return () => dispatch(reset())`) hanya karena user pindah halaman. Reset state hanya boleh terjadi pada aksi eksplisit seperti logout, ganti periode akademik aktif, atau submit form yang memang mengubah data.
- Local component state (`useState`) untuk hal seperti filter/pencarian di halaman boleh reset saat unmount — itu wajar. Yang tidak boleh reset adalah data hasil fetch dari server yang disimpan di Redux/RTK Query cache.

### 6.4 Routing & Layout

- Layout utama (`AppShell.jsx`, sidebar, header) di-render sekali di level route induk (bukan di tiap halaman anak) menggunakan nested route React Router, supaya elemen yang tidak berubah antar halaman (sidebar, header, info user) tidak ikut ter-unmount/remount saat berpindah antar halaman di dalamnya.
- Jangan gunakan `<Navigate>` atau full remount (`key={location.pathname}` di root) yang memaksa seluruh tree component termasuk provider RTK Query ikut reset — ini akan membuang cache yang seharusnya dipertahankan.

### 6.5 Checklist Tambahan Khusus State Management

- [ ] Semua data server disimpan lewat RTK Query, bukan `useEffect` + fetch manual.
- [ ] Tidak ada kondisi render yang memakai `isFetching` untuk menampilkan skeleton penuh.
- [ ] `keepUnusedDataFor` sudah diatur sesuai jenis data (master data lebih lama, transaksional lebih pendek, tapi tidak nol).
- [ ] Tidak ada dispatch reset state di cleanup `useEffect` untuk kasus navigasi biasa.
- \[ ] Layout (sidebar/header) tidak ikut remount saat pindah antar halaman di dalam layout yang sama.

---

## 7. Checklist Sebelum AI Menyelesaikan Task

Sebelum menyatakan sebuah task selesai, AI wajib memastikan:

- \[ ] Semua tabel/kolom yang dipakai sudah sesuai nama di blueprint bagian 7.
- \[ ] Semua permission yang dicek sudah sesuai nama di blueprint bagian 2, dan diterapkan di backend (middleware/policy), bukan hanya di frontend.
- \[ ] Tidak ada file baru yang diletakkan di luar struktur folder bagian 2 dokumen ini.
- \[ ] Tidak ada folder/komponen yang dibuat berdasarkan role.
- \[ ] Jika ada entitas/endpoint/permission baru yang terpaksa dibuat di luar blueprint awal, blueprint sudah diperbarui atau minimal dilaporkan eksplisit ke user sebagai perubahan scope.
- \[ ] Validasi krusial ada di backend, bukan cuma di frontend.
- \[ ] Tidak ada hardcode role check (`if role === '...'`) — semua lewat permission.
- \[ ] Data fetching halaman memakai RTK Query dan tidak menampilkan skeleton ulang saat user kembali ke halaman yang datanya sudah pernah dimuat (lihat bagian 6).

---



| <br /> | <br /> | <br /> |
|:---|:---|:---|

| <br /> | <br /> | <br /> |
| <br /> | <br /> | <br /> |
| <br /> | <br /> | <br /> |
| <br /> | <br /> | <br /> |
| <br /> | <br /> | <br /> |
| <br /> | <br /> | <br /> |
| <br /> | <br /> | <br /> |
| <br /> | <br /> | <br /> |
