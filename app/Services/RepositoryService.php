<?php

namespace App\Services;

use App\Models\TugasAkhir;
use App\Models\Repository;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class RepositoryService
{
    /**
     * Get student's repository draft.
     */
    public function getStudentRepository(int $userId): ?Repository
    {
        try {
            $tugasAkhir = TugasAkhir::where('user_id', $userId)
                ->whereNotIn('status', ['batal'])
                ->first();

            if (!$tugasAkhir) {
                return null;
            }

            return Repository::where('tugas_akhir_id', $tugasAkhir->id)->first();
        } catch (\Exception $e) {
            Log::error('Fetch repository failed', ['user_id' => $userId, 'error' => $e->getMessage()]);
            throw $e;
        }
    }

    /**
     * Submit/update final TA repository data.
     */
    public function submitRepository(int $userId, array $data): Repository
    {
        try {
            $tugasAkhir = TugasAkhir::where('user_id', $userId)
                ->whereNotIn('status', ['batal'])
                ->first();

            if (!$tugasAkhir) {
                throw new \Exception('Anda belum mendaftarkan Tugas Akhir.');
            }

            // Ensure they are in a status allowed to submit final TA (like revisi_sidang, bimbingan, or disetujui depending on rules)
            // But let's keep it flexible so they can draft it anytime.
            
            $repoData = [
                'tugas_akhir_id' => $tugasAkhir->id,
                'abstrak_id' => $data['abstrak_id'],
                'abstrak_en' => $data['abstrak_en'],
                'kata_kunci' => $data['kata_kunci'],
                'is_public' => filter_var($data['is_public'] ?? true, FILTER_VALIDATE_BOOLEAN),
            ];

            // Files upload
            if (isset($data['file_pdf_full']) && $data['file_pdf_full']->isValid()) {
                $repoData['file_pdf_full'] = $data['file_pdf_full']->store('repository/pdf', 'public');
            }

            if (isset($data['file_jurnal']) && $data['file_jurnal']->isValid()) {
                $repoData['file_jurnal'] = $data['file_jurnal']->store('repository/jurnal', 'public');
            }

            if (isset($data['file_source_code']) && $data['file_source_code']->isValid()) {
                $repoData['file_source_code'] = $data['file_source_code']->store('repository/code', 'public');
            }

            $repository = Repository::updateOrCreate(
                ['tugas_akhir_id' => $tugasAkhir->id],
                $repoData
            );

            Log::info('TA Repository submitted/updated', [
                'user_id' => $userId,
                'repo_id' => $repository->id,
            ]);

            return $repository;
        } catch (\Exception $e) {
            Log::error('Submit repository failed', ['user_id' => $userId, 'error' => $e->getMessage()]);
            throw $e;
        }
    }
}
