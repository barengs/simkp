<?php

namespace App\Services;

use App\Models\TugasAkhir;
use App\Models\JadwalUjian;
use App\Models\NilaiUjian;
use App\Models\DokumenPersyaratan;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Database\Eloquent\Collection;

class SidangService
{
    /**
     * Get student exam schedules and registration status.
     */
    public function getStudentSidangData(int $userId): array
    {
        try {
            $tugasAkhir = TugasAkhir::where('user_id', $userId)
                ->whereNotIn('status', ['batal'])
                ->first();

            if (!$tugasAkhir) {
                return [
                    'tugas_akhir' => null,
                    'schedules' => [],
                    'requirements' => [],
                ];
            }

            $schedules = JadwalUjian::where('tugas_akhir_id', $tugasAkhir->id)
                ->with(['nilaiUjian.dosen'])
                ->latest()
                ->get();

            $requirements = DokumenPersyaratan::where('tugas_akhir_id', $tugasAkhir->id)->get();

            return [
                'tugas_akhir' => $tugasAkhir,
                'schedules' => $schedules,
                'requirements' => $requirements,
            ];
        } catch (\Exception $e) {
            Log::error('Fetch student sidang data failed', ['user_id' => $userId, 'error' => $e->getMessage()]);
            throw $e;
        }
    }

    /**
     * Submit requirements (KRS, TOEFL, Proposal Draft, etc.) for registration.
     */
    public function submitRequirement(int $userId, string $namaDokumen, $file): DokumenPersyaratan
    {
        try {
            $tugasAkhir = TugasAkhir::where('user_id', $userId)
                ->whereNotIn('status', ['batal'])
                ->first();

            if (!$tugasAkhir) {
                throw new \Exception('Anda belum mendaftarkan Tugas Akhir.');
            }

            if (!$file->isValid()) {
                throw new \Exception('File tidak valid.');
            }

            $path = $file->store('persyaratan_ta', 'public');

            $doc = DokumenPersyaratan::updateOrCreate(
                [
                    'tugas_akhir_id' => $tugasAkhir->id,
                    'nama_dokumen' => $namaDokumen,
                ],
                [
                    'file_path' => $path,
                    'status_validasi' => 'pending',
                    'catatan' => null,
                ]
            );

            Log::info('TA requirement document uploaded', [
                'user_id' => $userId,
                'doc_id' => $doc->id,
                'nama_dokumen' => $namaDokumen,
            ]);

            return $doc;
        } catch (\Exception $e) {
            Log::error('Upload requirement failed', ['user_id' => $userId, 'error' => $e->getMessage()]);
            throw $e;
        }
    }

    /**
     * Submit revision to examiner for ACC approval.
     */
    public function submitRevision(int $userId, int $nilaiUjianId, $file): NilaiUjian
    {
        try {
            $nilai = NilaiUjian::findOrFail($nilaiUjianId);
            $schedule = $nilai->jadwalUjian;

            if ($schedule->tugasAkhir->user_id !== $userId) {
                throw new \Exception('Anda tidak memiliki otorisasi.');
            }

            if (!$file->isValid()) {
                throw new \Exception('File tidak valid.');
            }

            // Store revision document path inside the catatan_revisi, or a separate structure if needed.
            // For this implementation, we will append/save the file path, and notify the examiner.
            $path = $file->store('revisi_ujian', 'public');

            // Save the path inside a customized format or notes
            $nilai->update([
                'catatan_revisi' => "Draft Revisi Terunggah: " . asset('storage/' . $path) . "\n\nCatatan Sebelumnya:\n" . $nilai->catatan_revisi,
                'status_acc_revisi' => false, // reset back to false so examiner can ACC again
            ]);

            Log::info('Exam revision submitted', [
                'user_id' => $userId,
                'nilai_ujian_id' => $nilaiUjianId,
                'path' => $path,
            ]);

            return $nilai->load('dosen');
        } catch (\Exception $e) {
            Log::error('Submit revision failed', ['user_id' => $userId, 'nilai_id' => $nilaiUjianId, 'error' => $e->getMessage()]);
            throw $e;
        }
    }
}
