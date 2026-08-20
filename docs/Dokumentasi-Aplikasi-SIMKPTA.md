# Dokumentasi Gambaran Umum Aplikasi SIM-KPTA
**Nama Aplikasi:** SIM-KPTA (Sistem Informasi Manajemen Kerja Praktek dan Tugas Akhir)
**Institusi:** Universitas Islam Madura

**Tanggal Dokumen:** 19 Agustus 2026

---

## 1. Latar Belakang

Pelaksanaan Kerja Praktek (KP) dan Tugas Akhir (TA) merupakan tahapan krusial dalam perjalanan akademik mahasiswa. Sebelumnya, proses administrasi, mulai dari pendaftaran, pembagian dosen pembimbing, pemantauan kegiatan (logbook), hingga penilaian, masih banyak mengandalkan metode manual atau pemberkasan fisik. Hal ini menimbulkan berbagai tantangan, seperti sulitnya memantau perkembangan mahasiswa secara aktual, risiko hilangnya dokumen, lambatnya proses verifikasi, serta kesulitan dalam rekapitulasi nilai dan laporan akhir.

Oleh karena itu, diperlukan sebuah solusi digital yang terintegrasi. Aplikasi SIM-KPTA dikembangkan untuk mengotomatisasi dan menyederhanakan seluruh alur proses tersebut, sehingga interaksi antara mahasiswa, dosen pembimbing, dan pihak pengelola (koordinator/admin) menjadi lebih transparan, terukur, dan efisien.

## 2. Tujuan Aplikasi

Pengembangan aplikasi SIM-KPTA bertujuan untuk memberikan manfaat strategis bagi institusi, di antaranya:
1. **Efisiensi Administratif:** Memangkas waktu dan upaya yang dibutuhkan untuk mengelola dokumen pendaftaran, pembagian pembimbing, dan rekapitulasi penilaian.
2. **Transparansi dan Akuntabilitas:** Seluruh proses pengajuan, bimbingan, dan evaluasi terekam dengan jelas di dalam sistem dan dapat dilacak kapan saja oleh pihak yang berkepentingan.
3. **Kemudahan Pemantauan (Monitoring):** Memudahkan pimpinan dan koordinator untuk memantau progres pelaksanaan Kerja Praktek mahasiswa dan kinerja bimbingan secara tepat waktu (real-time).
4. **Sentralisasi Data dan Pengarsipan Digital:** Menyediakan satu wadah terpusat untuk menyimpan seluruh berkas laporan, catatan bimbingan, dan data mitra institusi dengan aman, sehingga memudahkan pencarian kembali di masa mendatang.

## 3. Ruang Lingkup Aplikasi

Saat ini, aplikasi berfokus pada digitalisasi proses **Kerja Praktek (KP)**, yang meliputi:
- Pengelolaan data induk (dosen, mahasiswa, mitra, periode akademik, dan tema Kerja Praktek).
- Siklus pelaksanaan Kerja Praktek, mulai dari pembentukan kelompok, pendaftaran, verifikasi, hingga penentuan dosen pembimbing.
- Pelaksanaan bimbingan harian melalui catatan kegiatan (logbook) yang dipantau dan divalidasi oleh dosen pembimbing.
- Pengumpulan laporan akhir Kerja Praktek dan evaluasi/penilaian oleh dosen.

*(Catatan: Modul Tugas Akhir sedang dalam tahap perencanaan pengembangan lanjutan dan akan diintegrasikan dengan pola yang selaras dengan modul Kerja Praktek).*

## 4. Pengguna Aplikasi

Aplikasi ini dirancang dengan pembagian hak akses yang fleksibel sesuai dengan peran masing-masing pengguna di institusi:

- **Admin**
  Bertanggung jawab atas pengaturan dasar sistem. Admin mengelola data induk (master data) yang menjadi fondasi jalannya aplikasi, seperti mendaftarkan akun dosen dan mahasiswa, mencatat data instansi/mitra Kerja Praktek, serta mengatur periode akademik yang sedang berjalan.
  
- **Koordinator**
  Berperan sebagai pengelola utama kegiatan operasional Kerja Praktek. Koordinator bertugas meninjau dan memverifikasi pengajuan pendaftaran dari mahasiswa, serta menentukan (plotting) dosen pembimbing yang tepat untuk masing-masing kelompok mahasiswa.
  
- **Dosen (Pembimbing)**
  Bertugas mendampingi dan mengevaluasi mahasiswa selama masa Kerja Praktek. Dosen dapat memantau perkembangan mahasiswa melalui catatan harian (logbook), memberikan umpan balik (validasi), meninjau laporan akhir, dan memberikan nilai akhir kegiatan.
  
- **Mahasiswa**
  Sebagai pelaku utama kegiatan Kerja Praktek. Mahasiswa dapat membentuk kelompok, mengajukan pendaftaran Kerja Praktek secara mandiri, mengisi catatan kegiatan harian (logbook), mengunggah laporan akhir, serta melihat hasil penilaian dari dosen pembimbing.

## 5. Alur Proses Utama

Berikut adalah tahapan pelaksanaan Kerja Praktek yang diakomodasi oleh aplikasi, dari awal hingga akhir:

1. **Persiapan Data (Oleh Admin):** Admin menyiapkan periode akademik yang aktif dan memastikan data mahasiswa, dosen, serta mitra sudah tersedia di dalam sistem.
2. **Pengajuan Pendaftaran (Oleh Mahasiswa):** Mahasiswa mencari rekan untuk membentuk kelompok, kemudian mengisi formulir pendaftaran Kerja Praktek melalui aplikasi dengan memilih mitra/instansi dan tema yang dituju.
3. **Verifikasi dan Pembagian Pembimbing (Oleh Koordinator):** Koordinator memeriksa berkas pendaftaran kelompok mahasiswa. Jika sesuai, pendaftaran disetujui. Setelah itu, koordinator menunjuk dosen pembimbing untuk kelompok tersebut.
4. **Pelaksanaan dan Pencatatan (Oleh Mahasiswa & Dosen):** Mahasiswa menjalankan Kerja Praktek dan wajib mengisi catatan kegiatan (logbook) secara rutin di aplikasi. Dosen pembimbing akan meninjau dan menyetujui logbook tersebut.
5. **Penyerahan Laporan (Oleh Mahasiswa):** Setelah masa Kerja Praktek selesai, mahasiswa mengunggah dokumen laporan akhir ke dalam sistem untuk diperiksa.
6. **Validasi dan Penilaian (Oleh Dosen):** Dosen memverifikasi kesesuaian laporan akhir, lalu memasukkan nilai akhir mahasiswa ke dalam sistem. Mahasiswa kemudian dapat melihat hasil akhir dari proses Kerja Praktek mereka.

## 6. Fitur Utama Aplikasi

Fitur-fitur yang ada dibangun untuk memberikan kemudahan bagi setiap pihak:

### A. Pengelolaan Data Dasar (Master Data)
- **Manajemen Pengguna (Mahasiswa & Dosen):** Sentralisasi pendaftaran akun dan pendataan civitas akademika.
- **Manajemen Mitra & Tema:** Pencatatan daftar instansi atau perusahaan tempat pelaksanaan Kerja Praktek beserta pilihan tema yang relevan.
- **Pengaturan Periode Akademik:** Penentuan batasan waktu dan semester aktif berjalannya program.

### B. Proses Pendaftaran dan Persetujuan
- **Pendaftaran Kelompok Mandiri:** Mahasiswa dapat dengan mudah mendaftarkan anggota kelompoknya secara digital, tanpa perlu mengisi formulir kertas.
- **Verifikasi Digital:** Koordinator dapat memeriksa kelengkapan syarat dan menyetujui pendaftaran mahasiswa dari mana saja tanpa perlu pertemuan tatap muka.
- **Distribusi Dosen Pembimbing (Plotting):** Fasilitas bagi koordinator untuk mengalokasikan dosen pembimbing secara merata dan terorganisir ke tiap-tiap kelompok.

### C. Pemantauan dan Evaluasi
- **Catatan Kegiatan Harian (Logbook) Digital:** Mahasiswa dapat mencatat kegiatan harian yang langsung dapat dibaca oleh dosen pembimbing.
- **Validasi Perkembangan Mahasiswa:** Dosen pembimbing dapat memberikan persetujuan atau catatan perbaikan pada logbook mahasiswa secara berkala.
- **Pengumpulan dan Validasi Laporan:** Fasilitas unggah dokumen laporan akhir tanpa perlu mencetak dokumen fisik yang tebal (paperless).
- **Penilaian Terintegrasi:** Dosen memasukkan nilai secara langsung ke dalam sistem, dan hasilnya langsung dapat dilihat oleh mahasiswa (fitur Nilai Saya).

## 7. Tampilan Aplikasi

Berikut adalah beberapa pratinjau antarmuka aplikasi SIM-KPTA:

**Halaman Utama (Dashboard)**
<!-- TODO: sisipkan screenshot halaman Dashboard/Beranda -->

**Halaman Pendaftaran Kelompok (Bagi Mahasiswa)**
<!-- TODO: sisipkan screenshot halaman Pendaftaran Kelompok -->

**Halaman Verifikasi dan Plotting Dosen (Bagi Koordinator)**
<!-- TODO: sisipkan screenshot halaman Verifikasi Pendaftaran / Plotting Dosen -->

**Halaman Pengisian Logbook (Bagi Mahasiswa)**
<!-- TODO: sisipkan screenshot halaman Logbook -->

**Halaman Penilaian (Bagi Dosen)**
<!-- TODO: sisipkan screenshot halaman Nilai -->

## 8. Manfaat bagi Institusi dan Penutup

Penerapan aplikasi SIM-KPTA memberikan dampak positif yang langsung dirasakan oleh institusi, di antaranya:
- **Penghematan Sumber Daya:** Berkurangnya penggunaan kertas dan ruang penyimpanan fisik berkat alur kerja digital (paperless).
- **Peningkatan Layanan Akademik:** Mempercepat proses birokrasi pendaftaran dan persetujuan, sehingga mahasiswa dan dosen dapat lebih fokus pada substansi akademik.
- **Pengambilan Keputusan Berbasis Data:** Pimpinan dapat dengan mudah memantau sebaran tempat Kerja Praktek mahasiswa, beban bimbingan dosen, serta tingkat keberhasilan pelaksanaan program.

Sebagai rencana pengembangan lanjutan, sistem ini telah dirancang secara modular sehingga di masa depan akan dengan mudah mengakomodasi penambahan modul **Tugas Akhir**, yang akan mengintegrasikan seluruh tahapan akhir studi mahasiswa ke dalam satu payung aplikasi yang solid.
