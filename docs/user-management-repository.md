# Dokumentasi Menu Manajemen Pengguna & Repository

## 1. Manajemen Pengguna

### Deskripsi
Menu **Manajemen Pengguna** digunakan untuk mengelola akun pengguna sistem SIM-KPTA. Melalui menu ini, administrator dapat:

- Melihat daftar seluruh pengguna terdaftar
- Menambah pengguna baru (dosen, mahasiswa, koordinator, admin)
- Mengedit data profil pengguna (nama, email, NIP/NIM, program studi, status aktif)
- Menghapus pengguna
- Menugaskan role/peran kepada pengguna
- Mengatur foto profil pengguna

### Permission yang Diperlukan
- `pengaturan.manage`

### Role yang Bisa Mengakses
- **Admin** — akses penuh
- **Koordinator** — tidak memiliki akses ke menu ini

### Fitur Utama
| Fitur | Deskripsi |
|-------|-----------|
| Daftar Pengguna | Menampilkan semua pengguna dengan informasi nama, email, role, dan status |
| Tambah Pengguna | Membuat akun baru untuk dosen atau mahasiswa |
| Edit Pengguna | Memperbarui data profil dan role pengguna |
| Hapus Pengguna | Menghapus akun pengguna dari sistem |
| Assign Role | Menetapkan peran (admin, koordinator, dosen, mahasiswa) kepada pengguna |
| Upload Foto Profil | Mengunggah atau mengganti foto profil pengguna |

### Alur Data
1. Admin membuka menu **Manajemen Pengguna**
2. Sistem menampilkan daftar pengguna dari endpoint `GET /api/users`
3. Admin dapat melakukan CRUD operasi pada pengguna
4. Setiap perubahan role akan tercatat dalam sistem RBAC (Spatie Permission)

### Catatan
- Saat ini halaman Manajemen Pengguna belum sepenuhnya diimplementasikan di frontend.
- Role assignment dapat dilakukan melalui halaman **Manajemen Peran** dengan mengklik tombol "Buka Manajemen Pengguna".

---

## 2. Repository

### Deskripsi
Menu **Repository** digunakan untuk mengelola repositori dokumen Tugas Akhir (TA) dan Kerja Praktek (KP). Menu ini memungkinkan administrator dan koordinator untuk:

- Mempublikasikan dokumen TA/KP yang telah selesai
- Mengelola koleksi dokumen yang dipublikasikan
- Melihat dokumen yang tersedia untuk diakses oleh pengguna lain

### Permission yang Diperlukan
- `repository.publish` — untuk mempublikasikan dokumen (Admin, Koordinator)
- `repository.view` — untuk melihat dokumen repository (Semua role)

### Role yang Bisa Mengakses
| Role | Akses |
|------|-------|
| **Admin** | Publish + View |
| **Koordinator** | Publish + View |
| **Dosen** | View only |
| **Mahasiswa** | View only |

### Fitur Utama
| Fitur | Deskripsi |
|-------|-----------|
| Publikasi Dokumen | Mengupload dan mempublikasikan dokumen TA/KP yang telah selesai |
| Daftar Dokumen | Menampilkan koleksi dokumen yang sudah dipublikasikan |
| Detail Dokumen | Melihat informasi lengkap dokumen (judul, deskripsi, file, tanggal upload) |
| Unduh Dokumen | Mengunduh file dokumen yang dipublikasikan |

### Struktur Data Repository

Tabel `repository` menyimpan data dokumen dengan kolom:
- `id` — Primary key
- `title` — Judul dokumen
- `description` — Deskripsi singkat
- `file_url` — Path/file dokumen
- `file_type` — Tipe file (PDF, DOCX, dll.)
- `student_id` — Foreign key ke mahasiswa pengupload
- `lecturer_id` — Foreign key ke dosen penguji/pembimbing
- `uploaded_at` — Tanggal upload
- `status` — Status publikasi (public/private)
- `created_at` — Timestamp dibuat
- `updated_at` — Timestamp diperbarui

### Alur Data
1. Admin/Koordinator membuka menu **Repository**
2. Sistem menampilkan daftar dokumen yang sudah dipublikasikan
3. Admin dapat mempublikasikan dokumen baru melalui form upload
4. Dokumen yang dipublikasikan dapat diakses oleh semua pengguna dengan permission `repository.view`

### Catatan
- Saat ini halaman Repository belum sepenuhnya diimplementasikan di frontend.
- Backend model `Repository` sudah tersedia di `app/Models/Repository.php`.
- Migration untuk tabel repository sudah ada di `database/migrations/2024_01_07_000022_create_repository_table.php`.

---

## 3. Hubungan dengan Sistem RBAC

Kedua menu ini menggunakan sistem **Role-Based Access Control (RBAC)** dengan Spatie Permission:

| Menu | Permission | Role yang Dapat Mengakses |
|------|-----------|---------------------------|
| Manajemen Pengguna | `pengaturan.manage` | Admin |
| Repository (Publish) | `repository.publish` | Admin, Koordinator |
| Repository (View) | `repository.view` | Admin, Koordinator, Dosen, Mahasiswa |

### Catatan Penting
- Permission `repository.publish` digunakan untuk kontrol akses menu Repository di sidebar.
- Permission `repository.view` digunakan untuk kontrol akses melihat dokumen repository.
- Semua permission disimpan dalam tabel `permissions` dan di-assign ke role melalui tabel `model_has_permissions`.
