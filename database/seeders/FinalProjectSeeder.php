<?php

namespace Database\Seeders;

use App\Models\AcademicPeriod;
use App\Models\FinalProject;
use App\Models\Guidance;
use App\Models\Lecturer;
use App\Models\Student;
use Illuminate\Database\Seeder;

class FinalProjectSeeder extends Seeder
{
    public function run(): void
    {
        $now = now();

        $activePeriod = AcademicPeriod::where('is_active', true)->first()
            ?? AcademicPeriod::first();

        $students = Student::all();
        $lecturers = Lecturer::all();
        $demoDosen = Lecturer::whereHas('user', fn($q) => $q->where('email', 'dosen@simkpta.test'))->first() ?? $lecturers->first();

        if ($students->isEmpty() || $lecturers->isEmpty()) {
            $this->command->warn('Students or lecturers missing. Skipping FinalProjectSeeder.');
            return;
        }

        $projectsData = [
            [
                'title' => 'Rancang Bangun Sistem Informasi Pengelolaan Logistik Menggunakan Algoritma Dijkstra',
                'description' => 'Penelitian ini berfokus pada optimasi rute armada distribusi logistik pada pergudangan ritel modern.',
                'status' => 'pengajuan',
                'judul_disetujui' => null,
                'catatan_penolakan' => null,
            ],
            [
                'title' => 'Implementasi Machine Learning untuk Klasifikasi Citra Penyakit Daun Padi Menggunakan CNN',
                'description' => 'Deteksi dini hama penyakit tanaman padi melalui analisis citra daun berbasis convolutional neural network.',
                'status' => 'pengajuan',
                'judul_disetujui' => null,
                'catatan_penolakan' => null,
            ],
            [
                'title' => 'Sistem Rekomendasi Pemilihan Topik Skripsi Menggunakan Pendekatan TF-IDF dan Cosine Similarity',
                'description' => 'Membantu mahasiswa tingkat akhir dalam memetakan topik penelitian berdasarkan minat dan riwayat matakuliah.',
                'status' => 'bimbingan',
                'judul_disetujui' => 'Sistem Rekomendasi Pemilihan Topik Skripsi Menggunakan Pendekatan TF-IDF dan Cosine Similarity',
                'catatan_penolakan' => null,
            ],
            [
                'title' => 'Analisis Sentimen Opini Publik Terhadap Layanan Publik Menggunakan Naive Bayes dan IndoBERT',
                'description' => 'Eksplorasi data Twitter/X untuk mengetahui sentimen masyarakat terhadap keterbukaan informasi publik daerah.',
                'status' => 'bimbingan',
                'judul_disetujui' => 'Analisis Sentimen Opini Publik Terhadap Layanan Publik Menggunakan Naive Bayes dan IndoBERT',
                'catatan_penolakan' => null,
            ],
            [
                'title' => 'Aplikasi Pemesanan Tiket Transportasi Online',
                'description' => 'Aplikasi mobile untuk pemesanan tiket angkutan kota.',
                'status' => 'revisi_judul',
                'judul_disetujui' => null,
                'catatan_penolakan' => 'Judul dan ruang lingkup terlalu umum. Harap tentukan algoritma atau nilai kebaruan (novelty) spesifik yang diangkat.',
            ],
        ];

        $stdIdx = 0;
        foreach ($projectsData as $data) {
            $mhs = $students->get($stdIdx++);
            if (!$mhs) break;

            $fp = FinalProject::create([
                'title' => $data['title'],
                'description' => $data['description'],
                'mahasiswa_id' => $mhs->id,
                'periode_id' => $activePeriod->id,
                'judul_disetujui' => $data['judul_disetujui'],
                'catatan_penolakan' => $data['catatan_penolakan'],
                'tanggal_pengajuan' => $now->toDateString(),
                'status' => $data['status'],
                'created_at' => $now,
                'updated_at' => $now,
            ]);

            // Jika status bimbingan, tambahkan sesi bimbingan contoh
            if ($data['status'] === 'bimbingan') {
                Guidance::create([
                    'student_id' => $mhs->id,
                    'lecturer_id' => $demoDosen->id,
                    'notes' => 'Bab 1 Latar Belakang dan Rumusan Masalah sudah terstruktur dengan baik. Lanjutkan perancangan kajian pustaka Bab 2.',
                    'type' => 'BAB 1-2',
                    'guidance_date' => $now->copy()->subDays(3)->toDateString(),
                    'created_at' => $now->copy()->subDays(3),
                    'updated_at' => $now->copy()->subDays(3),
                ]);

                Guidance::create([
                    'student_id' => $mhs->id,
                    'lecturer_id' => $demoDosen->id,
                    'notes' => 'Perbaiki diagram UML use case dan perjelas parameter evaluasi akurasi sistem.',
                    'type' => 'BAB 3',
                    'guidance_date' => $now->toDateString(),
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
            }
        }

        $this->command->info(count($projectsData) . ' final projects & guidances created successfully with current timestamp ' . $now->toDateTimeString() . '!');
    }
}

