<?php

namespace Database\Seeders;

use App\Models\AcademicPeriod;
use App\Models\DocumentType;
use App\Models\KpCompany;
use App\Models\KpDocument;
use App\Models\KpGroup;
use App\Models\KpGroupMember;
use App\Models\KpTheme;
use App\Models\Lecturer;
use App\Models\Logbook;
use App\Models\Student;
use App\Models\User;
use Illuminate\Database\Seeder;

class KpGroupSeeder extends Seeder
{
    public function run(): void
    {
        $now = now();

        $activePeriod = AcademicPeriod::where('is_active', true)->first()
            ?? AcademicPeriod::first();

        $companies = KpCompany::all();
        $themes = KpTheme::all();
        $lecturers = Lecturer::all();
        $docTypes = DocumentType::all();
        $demoDosen = Lecturer::whereHas('user', fn($q) => $q->where('email', 'dosen@simkpta.test'))->first() ?? $lecturers->first();

        $demoStudent = Student::whereHas('user', fn($q) => $q->where('email', 'mahasiswa@simkpta.test'))->first();
        $otherStudents = Student::where('id', '!=', $demoStudent?->id ?? 0)->get();

        if ($companies->isEmpty() || $themes->isEmpty() || $otherStudents->isEmpty()) {
            $this->command->warn('Prerequisite data missing. Skipping KpGroupSeeder.');
            return;
        }

        $docProposal = $docTypes->firstWhere('name', 'Proposal Kerja Praktik') ?? $docTypes->first();
        $docSurat = $docTypes->firstWhere('name', 'Surat Penerimaan Mitra (Acceptance Letter)') ?? $docTypes->skip(1)->first();

        // ── 1. KELOMPOK DEMO MAHASISWA (Status: submitted / Menunggu Validasi) ────────
        $studentIndex = 0;
        $mhsAnggota1 = $otherStudents->get($studentIndex++);
        $mhsAnggota2 = $otherStudents->get($studentIndex++);

        $group1 = KpGroup::create([
            'academic_period_id' => $activePeriod->id,
            'kp_company_id' => $companies->first()->id,
            'kp_theme_id' => $themes->first()->id,
            'start_date' => $now->copy()->startOfMonth()->toDateString(),
            'end_date' => $now->copy()->addMonths(2)->endOfMonth()->toDateString(),
            'status' => 'submitted',
            'description' => 'Rancang bangun sistem informasi layanan operasional pelanggan berbasis web responsif.',
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        if ($demoStudent) {
            KpGroupMember::create([
                'kp_group_id' => $group1->id,
                'student_id' => $demoStudent->id,
                'role' => 'ketua',
                'status' => 'active',
                'join_date' => $now->toDateString(),
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        if ($mhsAnggota1) {
            KpGroupMember::create([
                'kp_group_id' => $group1->id,
                'student_id' => $mhsAnggota1->id,
                'role' => 'anggota',
                'status' => 'active',
                'join_date' => $now->toDateString(),
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        if ($mhsAnggota2) {
            KpGroupMember::create([
                'kp_group_id' => $group1->id,
                'student_id' => $mhsAnggota2->id,
                'role' => 'anggota',
                'status' => 'active',
                'join_date' => $now->toDateString(),
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        if ($docProposal) {
            KpDocument::create([
                'title' => 'Proposal KP - ' . $group1->kpCompany->name,
                'document_type_id' => $docProposal->id,
                'kp_group_id' => $group1->id,
                'student_id' => $demoStudent?->id ?? $mhsAnggota1->id,
                'file_url' => 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
                'submitted_at' => $now,
                'status' => 'submitted',
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        if ($docSurat) {
            KpDocument::create([
                'title' => 'Surat Balasan Penerimaan Mitra',
                'document_type_id' => $docSurat->id,
                'kp_group_id' => $group1->id,
                'student_id' => $demoStudent?->id ?? $mhsAnggota1->id,
                'file_url' => 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
                'submitted_at' => $now,
                'status' => 'submitted',
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        // ── 2. KELOMPOK 2 (Status: submitted dengan 1 dokumen revisi) ───────────────
        $k2Ketua = $otherStudents->get($studentIndex++);
        $k2Anggota = $otherStudents->get($studentIndex++);

        $group2 = KpGroup::create([
            'academic_period_id' => $activePeriod->id,
            'kp_company_id' => $companies->skip(1)->first()?->id ?? $companies->first()->id,
            'kp_theme_id' => $themes->skip(1)->first()?->id ?? $themes->first()->id,
            'start_date' => $now->copy()->startOfMonth()->toDateString(),
            'end_date' => $now->copy()->addMonths(2)->endOfMonth()->toDateString(),
            'status' => 'submitted',
            'description' => 'Pengembangan modul absensi dan monitoring kerja berbasis mobile application.',
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        if ($k2Ketua) {
            KpGroupMember::create([
                'kp_group_id' => $group2->id,
                'student_id' => $k2Ketua->id,
                'role' => 'ketua',
                'status' => 'active',
                'join_date' => $now->toDateString(),
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }
        if ($k2Anggota) {
            KpGroupMember::create([
                'kp_group_id' => $group2->id,
                'student_id' => $k2Anggota->id,
                'role' => 'anggota',
                'status' => 'active',
                'join_date' => $now->toDateString(),
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        if ($docProposal) {
            KpDocument::create([
                'title' => 'Proposal KP - ' . $group2->kpCompany->name,
                'document_type_id' => $docProposal->id,
                'kp_group_id' => $group2->id,
                'student_id' => $k2Ketua->id,
                'file_url' => 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
                'submitted_at' => $now,
                'status' => 'revision',
                'notes' => 'Tanda tangan pimpinan instansi dan stempel basah pada proposal belum terlampir. Harap upload ulang berkas yang sudah dilegalisir.',
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }
        if ($docSurat) {
            KpDocument::create([
                'title' => 'Surat Balasan Penerimaan Mitra',
                'document_type_id' => $docSurat->id,
                'kp_group_id' => $group2->id,
                'student_id' => $k2Ketua->id,
                'file_url' => 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
                'submitted_at' => $now,
                'status' => 'approved',
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        // ── 3. KELOMPOK 3 (Status: approved - Siap Di-plot Dosen) ────────────────────
        $k3Ketua = $otherStudents->get($studentIndex++);
        $k3Anggota = $otherStudents->get($studentIndex++);

        $group3 = KpGroup::create([
            'academic_period_id' => $activePeriod->id,
            'kp_company_id' => $companies->skip(2)->first()?->id ?? $companies->first()->id,
            'kp_theme_id' => $themes->skip(2)->first()?->id ?? $themes->first()->id,
            'start_date' => $now->copy()->startOfMonth()->toDateString(),
            'end_date' => $now->copy()->addMonths(2)->endOfMonth()->toDateString(),
            'status' => 'approved',
            'description' => 'Analisis data performa penjualan dan dashboard Business Intelligence pada industri ritel.',
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        if ($k3Ketua) {
            KpGroupMember::create([
                'kp_group_id' => $group3->id,
                'student_id' => $k3Ketua->id,
                'role' => 'ketua',
                'status' => 'active',
                'join_date' => $now->toDateString(),
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }
        if ($k3Anggota) {
            KpGroupMember::create([
                'kp_group_id' => $group3->id,
                'student_id' => $k3Anggota->id,
                'role' => 'anggota',
                'status' => 'active',
                'join_date' => $now->toDateString(),
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        if ($docProposal) {
            KpDocument::create([
                'title' => 'Proposal KP Disetujui',
                'document_type_id' => $docProposal->id,
                'kp_group_id' => $group3->id,
                'student_id' => $k3Ketua->id,
                'file_url' => 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
                'submitted_at' => $now,
                'status' => 'approved',
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }
        if ($docSurat) {
            KpDocument::create([
                'title' => 'Surat Balasan Mitra Disetujui',
                'document_type_id' => $docSurat->id,
                'kp_group_id' => $group3->id,
                'student_id' => $k3Ketua->id,
                'file_url' => 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
                'submitted_at' => $now,
                'status' => 'approved',
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        // ── 4. KELOMPOK 4 (Status: approved - Sudah Di-plot ke Demo Dosen) ─────────
        $k4Ketua = $otherStudents->get($studentIndex++);
        $k4Anggota = $otherStudents->get($studentIndex++);

        $group4 = KpGroup::create([
            'academic_period_id' => $activePeriod->id,
            'kp_company_id' => $companies->skip(3)->first()?->id ?? $companies->first()->id,
            'kp_theme_id' => $themes->skip(3)->first()?->id ?? $themes->first()->id,
            'start_date' => $now->copy()->startOfMonth()->toDateString(),
            'end_date' => $now->copy()->addMonths(2)->endOfMonth()->toDateString(),
            'status' => 'approved',
            'description' => 'Otomasi deployment CI/CD pipeline dan containerization infrastruktur cloud.',
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        if ($k4Ketua) {
            KpGroupMember::create([
                'kp_group_id' => $group4->id,
                'student_id' => $k4Ketua->id,
                'role' => 'ketua',
                'status' => 'active',
                'join_date' => $now->toDateString(),
                'supervisor_lecturer_id' => $demoDosen->id,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }
        if ($k4Anggota) {
            KpGroupMember::create([
                'kp_group_id' => $group4->id,
                'student_id' => $k4Anggota->id,
                'role' => 'anggota',
                'status' => 'active',
                'join_date' => $now->toDateString(),
                'supervisor_lecturer_id' => $demoDosen->id,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        if ($docProposal) {
            KpDocument::create([
                'title' => 'Proposal KP Cloud Infrastructure',
                'document_type_id' => $docProposal->id,
                'kp_group_id' => $group4->id,
                'student_id' => $k4Ketua->id,
                'file_url' => 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
                'submitted_at' => $now,
                'status' => 'approved',
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }
        if ($docSurat) {
            KpDocument::create([
                'title' => 'Surat Penerimaan Mitra Cloud',
                'document_type_id' => $docSurat->id,
                'kp_group_id' => $group4->id,
                'student_id' => $k4Ketua->id,
                'file_url' => 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
                'submitted_at' => $now,
                'status' => 'approved',
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        // Sample logbooks pada bulan ini dan jam sekarang
        $logbookActivities = [
            ['day' => 6, 'act' => 'Orientasi tim IT dan pengenalan arsitektur jaringan cloud perusahaan mitra.', 'status' => 'approved'],
            ['day' => 4, 'act' => 'Analisis requirement pipeline integrasi GitLab CI dan konfigurasi Dockerfile.', 'status' => 'approved'],
            ['day' => 2, 'act' => 'Implementasi staging environment dan testing automated build script.', 'status' => 'pending'],
            ['day' => 0, 'act' => 'Monitoring performa server container dan pembuatan dokumentasi deployment harian.', 'status' => 'pending'],
        ];

        foreach ($logbookActivities as $log) {
            Logbook::create([
                'student_id' => $k4Ketua->id,
                'kp_group_id' => $group4->id,
                'date' => $now->copy()->subDays($log['day'])->toDateString(),
                'activity' => $log['act'],
                'status' => $log['status'],
                'created_at' => $now->copy()->subDays($log['day']),
                'updated_at' => $now->copy()->subDays($log['day']),
            ]);
        }

        // ── 5. KELOMPOK 5 (Status: rejected / Ditolak) ──────────────────────────────
        $k5Ketua = $otherStudents->get($studentIndex++);
        $k5Anggota = $otherStudents->get($studentIndex++);

        $group5 = KpGroup::create([
            'academic_period_id' => $activePeriod->id,
            'kp_company_id' => $companies->skip(4)->first()?->id ?? $companies->first()->id,
            'kp_theme_id' => $themes->first()->id,
            'start_date' => $now->copy()->startOfMonth()->toDateString(),
            'end_date' => $now->copy()->addMonths(2)->endOfMonth()->toDateString(),
            'status' => 'rejected',
            'rejection_note' => 'Instansi mitra yang diajukan tidak memenuhi kriteria minimal bidang teknologi informasi untuk pelaksanaan KP prodi.',
            'description' => 'Pengajuan kerja praktik pada instansi ritel non-teknologi.',
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        if ($k5Ketua) {
            KpGroupMember::create([
                'kp_group_id' => $group5->id,
                'student_id' => $k5Ketua->id,
                'role' => 'ketua',
                'status' => 'active',
                'join_date' => $now->toDateString(),
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        // ── 6. KELOMPOK 6 (Status: submitted / Menunggu Validasi) ────────────────────
        $k6Ketua = $otherStudents->get($studentIndex++);
        $k6Anggota = $otherStudents->get($studentIndex++);

        $group6 = KpGroup::create([
            'academic_period_id' => $activePeriod->id,
            'kp_company_id' => $companies->skip(5)->first()?->id ?? $companies->first()->id,
            'kp_theme_id' => $themes->skip(4)->first()?->id ?? $themes->first()->id,
            'start_date' => $now->copy()->startOfMonth()->toDateString(),
            'end_date' => $now->copy()->addMonths(2)->endOfMonth()->toDateString(),
            'status' => 'submitted',
            'description' => 'Implementasi sistem keamanan akses jaringan dan audit kepatuhan IT infrastruktur.',
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        if ($k6Ketua) {
            KpGroupMember::create([
                'kp_group_id' => $group6->id,
                'student_id' => $k6Ketua->id,
                'role' => 'ketua',
                'status' => 'active',
                'join_date' => $now->toDateString(),
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }
        if ($k6Anggota) {
            KpGroupMember::create([
                'kp_group_id' => $group6->id,
                'student_id' => $k6Anggota->id,
                'role' => 'anggota',
                'status' => 'active',
                'join_date' => $now->toDateString(),
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        if ($docProposal) {
            KpDocument::create([
                'title' => 'Proposal KP Keamanan Siber',
                'document_type_id' => $docProposal->id,
                'kp_group_id' => $group6->id,
                'student_id' => $k6Ketua->id,
                'file_url' => 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
                'submitted_at' => $now,
                'status' => 'submitted',
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        $this->command->info('KP Groups, members, documents, and logbooks created successfully with current timestamp ' . $now->toDateTimeString() . '!');
    }
}

