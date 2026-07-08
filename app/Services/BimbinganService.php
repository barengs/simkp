<?php

namespace App\Services;

use App\Models\Bimbingan;
use App\Models\TugasAkhir;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Database\Eloquent\Collection;

class BimbinganService
{
    /**
     * Get bimbingan entries for student's active TA.
     */
    public function getStudentBimbingan(int $userId): Collection
    {
        try {
            $tugasAkhir = TugasAkhir::where('user_id', $userId)
                ->whereNotIn('status', ['batal'])
                ->first();

            if (!$tugasAkhir) {
                return new Collection();
            }

            return Bimbingan::where('tugas_akhir_id', $tugasAkhir->id)
                ->with(['dosen'])
                ->latest()
                ->get();
        } catch (\Exception $e) {
            Log::error('Fetch student bimbingan failed', ['user_id' => $userId, 'error' => $e->getMessage()]);
            throw $e;
        }
    }

    /**
     * Create a new bimbingan logbook.
     */
    public function createBimbingan(int $userId, array $data): Bimbingan
    {
        try {
            $tugasAkhir = TugasAkhir::where('user_id', $userId)
                ->whereNotIn('status', ['batal'])
                ->first();

            if (!$tugasAkhir) {
                throw new \Exception('Anda belum mendaftarkan Tugas Akhir.');
            }

            if ($tugasAkhir->status === 'pengajuan' || $tugasAkhir->status === 'revisi_judul') {
                throw new \Exception('Pendaftaran Tugas Akhir Anda belum disetujui untuk memulai bimbingan.');
            }

            // Determine which lecturer to bimbingan with (pembimbing 1 by default, or choice if provided)
            $dosenId = $data['dosen_id'] ?? $tugasAkhir->pembimbing_1_id;
            if (!$dosenId) {
                throw new \Exception('Dosen pembimbing belum ditentukan.');
            }

            $bimbinganData = [
                'tugas_akhir_id' => $tugasAkhir->id,
                'dosen_id' => $dosenId,
                'tanggal_bimbingan' => $data['tanggal_bimbingan'] ?? now()->toDateString(),
                'topik_bahasan' => $data['topik_bahasan'],
                'catatan_mahasiswa' => $data['catatan_mahasiswa'] ?? null,
                'status' => 'pending',
            ];

            // File upload if exists
            if (isset($data['file_draft']) && $data['file_draft']->isValid()) {
                $bimbinganData['file_draft'] = $data['file_draft']->store('bimbingan_drafts', 'public');
            }

            $bimbingan = Bimbingan::create($bimbinganData);

            Log::info('Bimbingan logbook created', [
                'user_id' => $userId,
                'bimbingan_id' => $bimbingan->id,
                'tugas_akhir_id' => $tugasAkhir->id,
            ]);

            return $bimbingan->load('dosen');
        } catch (\Exception $e) {
            Log::error('Create bimbingan failed', ['user_id' => $userId, 'error' => $e->getMessage()]);
            throw $e;
        }
    }

    /**
     * Delete a bimbingan entry.
     */
    public function deleteBimbingan(int $userId, int $bimbinganId): void
    {
        try {
            $bimbingan = Bimbingan::findOrFail($bimbinganId);
            $tugasAkhir = $bimbingan->tugasAkhir;

            if ($tugasAkhir->user_id !== $userId) {
                throw new \Exception('Anda tidak memiliki otorisasi untuk menghapus bimbingan ini.');
            }

            if ($bimbingan->status !== 'pending') {
                throw new \Exception('Bimbingan yang sudah divalidasi dosen tidak dapat dihapus.');
            }

            if ($bimbingan->file_draft) {
                Storage::disk('public')->delete($bimbingan->file_draft);
            }

            $bimbingan->delete();

            Log::info('Bimbingan logbook deleted', [
                'user_id' => $userId,
                'bimbingan_id' => $bimbinganId,
            ]);
        } catch (\Exception $e) {
            Log::error('Delete bimbingan failed', ['user_id' => $userId, 'bimbingan_id' => $bimbinganId, 'error' => $e->getMessage()]);
            throw $e;
        }
    }
}
