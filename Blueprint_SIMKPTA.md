# BLUEPRINT APLIKASI SIM-KPTA
## Sistem Informasi Manajemen Kerja Praktek & Tugas Akhir
### Dokumen Spesifikasi Teknis

---

## 1. Deskripsi Umum

SIM-KPTA adalah aplikasi web yang mengelola dua proses akademik: **Kerja Praktek (KP)**, yang dijalankan berkelompok, dan **Tugas Akhir (TA)**, yang dijalankan individu. Sejumlah parameter operasional (nama aplikasi, logo, favicon, jumlah anggota kelompok KP) dapat dikonfigurasi oleh Admin melalui antarmuka aplikasi, tanpa memerlukan perubahan kode atau deployment ulang.

**Tumpukan Teknologi**

| Komponen | Teknologi |
|---|---|
| Backend | Laravel 12, REST API |
| Frontend | React (Vite), source di `resources/js`, di-mount sebagai SPA dari `resources/views/index.blade.php` |
| Autentikasi | Laravel Sanctum (SPA cookie/session-based) |
| Otorisasi | spatie/laravel-permission — RBAC dinamis, akses diatur lewat permission |
| State management | Redux Toolkit |
| Styling | Tailwind CSS |
| Storage | S3-compatible (MinIO/AWS S3) untuk dokumen dan file branding |
| Queue | Laravel Queue untuk notifikasi & proses berat |

---

## 2. Aktor & Hak Akses (RBAC)

| Role | Deskripsi |
|---|---|
| **Admin** | Data master, pengguna, role & permission, pengaturan aplikasi (branding, jumlah anggota kelompok). |
| **Koordinator** | Verifikasi pendaftaran KP & judul TA, plotting dosen, monitoring. |
| **Dosen** | Satu role tunggal. Status pembimbing/penguji ditentukan dari tabel relasi (`dosen_pembimbing`, `dosen_penguji`), bukan role terpisah. |
| **Mahasiswa** | Kelompok KP, pengajuan TA individu, logbook, laporan. |

| Permission | Admin | Koordinator | Dosen | Mahasiswa |
|---|:---:|:---:|:---:|:---:|
| `pengaturan.manage` | ✅ | – | – | – |
| `master-data.manage` | ✅ | – | – | – |
| `kp.verifikasi-pendaftaran` | ✅ | ✅ | – | – |
| `kp.plotting-dosen` | – | ✅ | – | – |
| `kp.logbook.approve` | – | – | ✅ (jika pembimbing kelompok tsb) | – |
| `kp.laporan.approve` | – | – | ✅ (jika pembimbing kelompok tsb) | – |
| `kp.nilai.input` | – | – | ✅ (jika pembimbing kelompok tsb) | – |
| `kp.kelompok.create` | – | – | – | ✅ |
| `ta.verifikasi-judul` | – | ✅ | – | – |
| `ta.plotting-dosen` | – | ✅ | – | – |
| `ta.bimbingan.approve` | – | – | ✅ (jika pembimbing) | – |
| `ta.nilai.input` | – | – | ✅ (jika penguji) | – |
| `ta.pengajuan.create` | – | – | – | ✅ |
| `repository.publish` | ✅ | ✅ | – | – |

Role baru dibuat dengan insert row ke tabel `roles`. Permission baru dibuat dengan insert row ke tabel `permissions`, lalu di-assign lewat `role->givePermissionTo()`. Penambahan atau perubahan kombinasi role/permission tidak memerlukan migration maupun deployment ulang.

---

## 3. Arsitektur Frontend — RBAC Berbasis Modul

### 3.1 Prinsip Struktur

Struktur folder frontend dibagi **berdasarkan domain/fitur** (`kp`, `ta`, `pengaturan`, `master-data`), **bukan berdasarkan role**. Siapa yang boleh mengakses suatu halaman atau menu diatur sepenuhnya lewat permission, bukan lewat penempatan folder. Prinsip ini penting karena dua alasan struktural:

1. **Satu halaman sering dipakai oleh lebih dari satu role dengan variasi kecil.** Contoh: halaman "Detail Kelompok KP" dilihat oleh Koordinator (untuk verifikasi), Dosen (untuk approve logbook/nilai), dan Admin (untuk audit) — isinya 90% sama, hanya tombol aksi yang berbeda. Struktur berbasis modul menghindari duplikasi komponen dan menjaga perubahan tampilan cukup dilakukan di satu tempat.
2. **Role bersifat dinamis** (dikelola lewat Spatie Permission), sedangkan struktur folder bersifat statis (ditentukan saat build). Menyatukan navigasi/routing dengan struktur role akan memaksa perubahan kode dan deployment ulang setiap kali kombinasi akses berubah — bertentangan dengan tujuan RBAC dinamis itu sendiri.

### 3.2 Struktur Direktori

```
resources/js/
├── app.jsx
├── main.jsx
├── router/
│   ├── AppRouter.jsx
│   └── ProtectedRoute.jsx        # cek permission dari Redux state
├── store/slices/
│   ├── authSlice.js              # user, roles[], permissions[]
│   ├── settingsSlice.js          # app_name, logo_path, favicon_path, dst (lihat bagian 6)
│   └── notifSlice.js
├── config/
│   └── menuConfig.js             # satu sumber kebenaran untuk semua item menu
├── layouts/
│   └── AppShell.jsx              # sidebar dinamis: render menuConfig terfilter permission user
├── modules/
│   ├── kp/            pages, components, api
│   ├── ta/            pages, components, api
│   ├── master-data/   pages, components, api
│   ├── pengaturan/    pages, components, api       # branding & jumlah anggota kelompok (Admin)
│   └── shared/        Bimbingan, JadwalUjian, Nilai, Notifikasi
└── components/ui/
```

### 3.3 Dua Lapis Kontrol Akses

**Lapis 1 — Menu (`menuConfig.js`):** setiap item menu memiliki atribut `permission` yang dibutuhkan. Sidebar melakukan filter array ini terhadap permission milik user yang sedang login.

```js
// config/menuConfig.js
export const menuConfig = [
  { label: 'Dashboard', path: '/dashboard', permission: null }, // semua role
  { label: 'Kelompok Saya', path: '/kp/kelompok', permission: 'kp.kelompok.create' },
  { label: 'Verifikasi Pendaftaran KP', path: '/kp/verifikasi', permission: 'kp.verifikasi-pendaftaran' },
  { label: 'Plotting Dosen KP', path: '/kp/plotting', permission: 'kp.plotting-dosen' },
  { label: 'Pengaturan Aplikasi', path: '/pengaturan', permission: 'pengaturan.manage' },
  // seluruh menu didaftarkan sekali di sini
];
```

```jsx
// layouts/AppShell.jsx (sidebar)
const { permissions } = useSelector(s => s.auth);
const visibleMenu = menuConfig.filter(m => !m.permission || permissions.includes(m.permission));
```

**Lapis 2 — Route guard (`ProtectedRoute.jsx`):** mencegah akses langsung lewat URL walaupun menu tidak ditampilkan.

```jsx
function ProtectedRoute({ permission, children }) {
  const { permissions } = useSelector(s => s.auth);
  if (permission && !permissions.includes(permission)) return <Navigate to="/403" />;
  return children;
}
```

**Catatan penting:** pengecekan permission di frontend hanya berfungsi untuk UX (menyembunyikan menu/tombol yang tidak relevan) dan **bukan pengganti keamanan backend**. Otorisasi sesungguhnya tetap wajib diterapkan di backend melalui middleware (`->middleware('permission:kp.verifikasi-pendaftaran')`) dan Laravel Policy untuk validasi relasi spesifik (misalnya memastikan seorang dosen benar merupakan pembimbing dari kelompok yang diaksesnya).

### 3.4 Contoh Alur Penambahan Role Baru

Ilustrasi: menambahkan role **"Staff TU"** yang hanya boleh melihat monitoring KP tanpa hak approve apa pun.

1. `Role::create(['name' => 'staff_tu'])` — dilakukan sebagai data, bukan kode.
2. Buat permission baru bila belum ada yang sesuai, misalnya `kp.monitoring.view`, lalu assign ke role tersebut.
3. Jika halaman "Monitoring KP" sudah ada (dipakai Koordinator), cukup tambahkan permission tersebut ke item menu terkait di `menuConfig.js`, serta ke middleware route backend yang relevan. Tidak diperlukan folder baru, halaman baru, maupun duplikasi kode.
4. Jika halaman tersebut belum ada, itu merupakan kebutuhan fitur baru (di luar cakupan arsitektur RBAC), dan tetap hanya ditulis satu kali di `modules/kp/pages/`, kemudian di-gate dengan permission — dapat dipakai oleh role manapun yang diberi izin.

Struktur ini menjaga agar *apa fiturnya* dan *siapa yang boleh memakainya* tetap menjadi dua hal yang independen dan dapat berubah secara terpisah.

---

## 4. Modul Kerja Praktek (KP) — Alur Bisnis

### 4.1 Pembentukan Kelompok (Jumlah Anggota Dinamis)

- Mahasiswa yang membuat kelompok otomatis menjadi **Ketua Kelompok**.
- Ketua menambahkan anggota lain berdasarkan NIM hingga kelompok mencapai jumlah anggota yang berlaku saat itu — default 3, dikonfigurasi oleh Admin dan dapat diubah menjadi 4/5/6 tanpa perubahan kode (lihat bagian 6.3). Form pendaftaran menampilkan indikator progres (misalnya "Tambah anggota (2/4)") sesuai angka yang berlaku.
- Validasi jumlah anggota dilakukan di level aplikasi, bukan sebagai constraint database, agar pesan error jelas dan angka minimum/maksimum mudah diubah lewat data.

### 4.2 – 4.10 Pemilihan Tempat KP, Tema, Periode, Dokumen, Verifikasi, Plotting, Logbook, Laporan, Penilaian

*(Detail teknis tiap tahap didokumentasikan pada lampiran alur bisnis KP dan menu terkait — lihat bagian 8 untuk ringkasan struktur menu per role.)*

### 4.11 Diagram Status Kelompok KP

```
draft ─▶ diajukan ─▶ ditolak ─(revisi)─▶ draft
              │
              ▼
          disetujui ─▶ berjalan ─▶ laporan_masuk ─▶ revisi_laporan ─(upload ulang)─▶ laporan_masuk
                                          │
                                          ▼
                                       dinilai ─▶ selesai
```

---

## 5. Modul Tugas Akhir (TA) — Alur Bisnis

Dijalankan secara individu oleh mahasiswa.

```
pengajuan ─(revisi_judul)─▶ diajukan ulang
     │
     ▼
diterima ─▶ bimbingan (loop upload draft & catatan sampai "ACC Ujian")
     │
     ▼
daftar_sidang ─▶ jadwal_ujian (proposal / hasil / sidang_akhir)
     │
     ▼
revisi_sidang ─(ACC revisi)─▶ lulus ─▶ masuk Repository
```

---

## 6. Konfigurasi Dinamis Aplikasi

### 6.1 Item yang Dibuat Dinamis

| Item | Dipakai di | Diatur oleh |
|---|---|---|
| Nama aplikasi (App Name) | `<title>` browser, sidebar, header email notifikasi | Admin |
| Logo | Sidebar, halaman login | Admin |
| Favicon | Tab browser | Admin |
| Jumlah anggota kelompok KP | Validasi pembentukan kelompok | Admin (per periode, lihat 6.3) |

### 6.2 Struktur Data — Key-Value

Agar pengaturan baru dapat ditambahkan di masa depan tanpa migration, digunakan tabel key-value, bukan satu kolom per setting:

```
pengaturan_aplikasi
- id
- key (unique)      -- 'app_name', 'logo_path', 'favicon_path', 'kp_jumlah_anggota_default'
- value (text, nullable)
- timestamps
```

```php
class Pengaturan
{
    public static function get(string $key, $default = null)
    {
        return Cache::rememberForever("pengaturan.$key", fn () =>
            PengaturanAplikasi::where('key', $key)->value('value') ?? $default
        );
    }

    public static function set(string $key, $value): void
    {
        PengaturanAplikasi::updateOrCreate(['key' => $key], ['value' => $value]);
        Cache::forget("pengaturan.$key");
    }
}
```

Nilai di-cache dengan `Cache::rememberForever` karena `app_name` dan `logo_path` dibaca pada hampir setiap request (layout & halaman login), sehingga menghindari query tambahan yang tidak perlu.

### 6.3 Jumlah Anggota Kelompok — Default Global dengan Override per Periode

Agar perubahan jumlah anggota tidak berdampak retroaktif pada kelompok yang sudah terbentuk di periode berjalan, angka ini disimpan dalam dua lapis:

- **Default global** → `pengaturan_aplikasi` dengan key `kp_jumlah_anggota_default` (misalnya 3).
- **Override per periode** → kolom `periode_akademik.jumlah_anggota_kp` (nullable int). Jika diisi, angka ini digunakan untuk periode tersebut; jika kosong, fallback ke default global.

```php
$jumlahAnggota = $kelompok->periode->jumlah_anggota_kp
    ?? Pengaturan::get('kp_jumlah_anggota_default', 3);
```

Dengan mekanisme ini, perubahan kebijakan (misalnya menjadi 4 orang di tahun berikutnya) cukup diatur pada periode baru, tanpa mengganggu kelompok yang sudah berjalan di periode sebelumnya.

### 6.4 Alur Teknis Logo, Favicon, dan App Name

- **Favicon & judul tab browser:** `index.blade.php` di-render Laravel di server pada setiap request (bukan file statis), sehingga dapat langsung diisi dari `Pengaturan::get()` — favicon dan judul sudah benar sejak halaman pertama kali dimuat, tanpa menunggu JavaScript berjalan:
  ```blade
  <link rel="icon" href="{{ Pengaturan::get('favicon_path', '/favicon-default.ico') }}">
  <title>{{ Pengaturan::get('app_name', 'SIM-KPTA') }}</title>
  ```
- **Logo di sidebar & app name di UI:** diambil lewat `GET /api/pengaturan/public` (tanpa autentikasi, karena halaman login juga membutuhkan logo), disimpan di `settingsSlice` Redux saat aplikasi pertama kali dimuat, dan dipakai di `AppShell.jsx`.
- **Update dari Admin:** dilakukan lewat halaman `modules/pengaturan/pages/PengaturanUmum.jsx` — form upload logo/favicon (disimpan ke S3/MinIO lewat `PengaturanController@update`, dengan validasi tipe dan ukuran file) serta input teks untuk App Name dan jumlah anggota kelompok default.

---

## 7. Struktur Basis Data

### 7.1 Master Data

| Tabel | Kolom Inti |
|---|---|
| `users` | id, name, email, password, is_active *(tanpa kolom role)* |
| `program_studi` | id, kode_prodi, nama_prodi, fakultas |
| `periode_akademik` | id, nama_periode, tanggal_mulai, tanggal_selesai, is_active, jumlah_anggota_kp (nullable) |
| `mahasiswa` | id, user_id (FK), prodi_id (FK), nim (unique), angkatan, no_hp |
| `dosen` | id, user_id (FK), prodi_id (FK), nidn (unique), jabatan_fungsional, kuota_bimbingan_kp, kuota_bimbingan_ta |
| `ruangan` | id, nama_ruangan, lokasi |
| `perusahaan_kp` | id, nama, alamat, contact_person, is_verified, diinput_oleh (nullable FK user) |
| `tema_kp` | id, nama_tema, deskripsi, is_active |
| `jenis_dokumen_kp` | id, nama_dokumen, is_wajib, urutan |
| `pengaturan_aplikasi` | id, key (unique), value, timestamps |

### 7.2 Modul KP

| Tabel | Kolom Inti |
|---|---|
| `kelompok_kp` | id, periode_id (FK), tema_id (FK), perusahaan_id (FK), ketua_mahasiswa_id (FK), status, catatan_penolakan, tanggal_pengajuan |
| `anggota_kelompok_kp` | id, kelompok_kp_id (FK), mahasiswa_id (FK), is_ketua (bool) |
| `dokumen_kp` | id, kelompok_kp_id (FK), jenis_dokumen_id (FK), file_path, status_validasi |

### 7.3 Modul TA

| Tabel | Kolom Inti |
|---|---|
| `tugas_akhir` | id, mahasiswa_id (FK), periode_id (FK), judul_diajukan, judul_disetujui, latar_belakang_singkat, status, tanggal_pengajuan |

### 7.4 Tabel Bersama (Polymorphic)

| Tabel | Kolom Inti | Catatan |
|---|---|---|
| `dosen_pembimbing` | pembimbingable_type/id, dosen_id, peran, status_acc_ujian | KP: 1 baris/kelompok. TA: 1–2 baris/mahasiswa |
| `dosen_penguji` | pengujiable_type/id, dosen_id, peran | TA (opsional untuk KP) |
| `bimbingan` | bimbingable_type/id, mahasiswa_id (nullable), dosen_id, tanggal, aktivitas, file, catatan_dosen, status | KP: `mahasiswa_id` diisi (logbook per anggota) |
| `laporan` | laporanable_type/id, jenis, file_laporan, status, catatan_dosen, tanggal_submit/keputusan | KP & TA |
| `jadwal_ujian` | ujianable_type/id, ruangan_id, jenis_ujian, tanggal, waktu, link_online, status | TA |
| `evaluation_criteria` | jenis, nama_kriteria, bobot | Rubrik dinamis |
| `nilai_kp` | kelompok_kp_id, mahasiswa_id (nullable), dosen_id, kriteria_id, nilai_angka, catatan | Kelompok/individu |
| `nilai_ujian` | jadwal_ujian_id, dosen_id, kriteria_id, nilai_angka, catatan_revisi, status_acc_revisi | TA |
| `repository` | tugas_akhir_id, abstrak_id/en, kata_kunci, file_pdf_full/jurnal/source_code, is_public | TA |
| `notifikasi` | user_id, title, message, type, url_action, is_read | Bersama |
| `status_histories` | historyable_type/id, status_from/to, changed_by, notes | Audit trail status |
| `log_aktivitas` | user_id, action, subject_type/id, ip_address, user_agent | Audit umum |

### 7.5 Tabel RBAC (auto dari package)

`roles`, `permissions`, `model_has_roles`, `model_has_permissions`, `role_has_permissions`.

---

## 8. Struktur Menu per Role

### 8.1 Admin

| Menu | Penjelasan |
|---|---|
| Pengaturan Aplikasi | Ubah App Name, upload logo & favicon, atur jumlah anggota kelompok default. |
| Master Data | Kelola data program studi, periode akademik, ruangan, perusahaan KP, tema KP, jenis dokumen. |
| Manajemen Pengguna | Kelola akun user (mahasiswa, dosen, koordinator, admin). |
| Manajemen Role & Permission | Kelola role dan kombinasi permission-nya. |
| Repository | Publikasi dokumen TA yang sudah selesai. |
| Log Aktivitas | Audit trail seluruh aksi di sistem. |

### 8.2 Koordinator, Dosen, Mahasiswa

Struktur menu untuk ketiga role ini mengikuti permission masing-masing sebagaimana didefinisikan pada tabel RBAC di bagian 2, dirender melalui `menuConfig.js` sesuai mekanisme yang dijelaskan pada bagian 3.3. Ringkasannya:

| Role | Menu Utama |
|---|---|
| Koordinator | Verifikasi Pendaftaran KP, Verifikasi Judul TA, Plotting Dosen (KP & TA), Monitoring KP/TA, Repository |
| Dosen | Bimbingan KP/TA (kelompok/mahasiswa yang dibimbing), Approve Logbook, Approve Laporan, Input Nilai, Jadwal Ujian (sebagai penguji) |
| Mahasiswa | Kelompok Saya (KP), Pengajuan TA, Logbook, Upload Laporan, Jadwal Sidang |

---

## 9. Struktur API Endpoint

```
# Pengaturan Aplikasi
GET    /api/pengaturan/public         # app_name, logo_path, favicon_path — tanpa auth
GET    /api/pengaturan                # semua setting, permission: pengaturan.manage
PUT    /api/pengaturan                # update app_name, jumlah_anggota_default
POST   /api/pengaturan/logo           # upload file logo
POST   /api/pengaturan/favicon        # upload file favicon

# Modul KP
GET    /api/kp/kelompok
POST   /api/kp/kelompok
GET    /api/kp/kelompok/{id}
POST   /api/kp/kelompok/{id}/anggota
POST   /api/kp/kelompok/{id}/dokumen
PUT    /api/kp/kelompok/{id}/verifikasi
PUT    /api/kp/kelompok/{id}/plotting-dosen

# Modul TA
GET    /api/ta/pengajuan
POST   /api/ta/pengajuan
PUT    /api/ta/pengajuan/{id}/verifikasi-judul
PUT    /api/ta/pengajuan/{id}/plotting-dosen

# Endpoint bersama (Bimbingan, Laporan, Jadwal Ujian, Nilai, Notifikasi, Repository)
GET    /api/bimbingan
POST   /api/bimbingan
GET    /api/laporan
POST   /api/laporan
GET    /api/jadwal-ujian
POST   /api/nilai
GET    /api/notifikasi
GET    /api/repository
```

---

## 10. Asumsi & Batasan

1. **Jumlah anggota kelompok** diasumsikan sebagai angka tetap per periode (bukan rentang, misalnya "3 sampai 5"). Jika yang dibutuhkan adalah rentang di mana mahasiswa bebas memilih jumlah anggota, tabel `periode_akademik` perlu ditambah dua kolom (`jumlah_anggota_min`, `jumlah_anggota_maks`) menggantikan satu kolom angka tetap.
2. **Favicon dan logo** disimpan sebagai path/URL ke file di storage (S3/MinIO), bukan sebagai data biner di database, agar tidak membebani query settings yang sering diakses.
3. **Perubahan App Name/logo bersifat global** untuk seluruh pengguna sistem (bukan per program studi atau per fakultas). Kebutuhan branding berbeda per prodi/fakultas memerlukan desain multi-tenant terpisah, di luar cakupan dokumen ini.

---

*Dokumen ini merupakan acuan spesifikasi teknis SIM-KPTA dan digunakan sebagai referensi tunggal untuk pengembangan sistem.*
