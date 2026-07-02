<?php

namespace App\Services;

use App\Models\TugasAkhir;
use App\Models\Internship;
use App\Models\InternshipMember;
use App\Models\ProfileUser;
use Illuminate\Support\Facades\Log;

class TugasAkhirService
{
    /**
     * Check if student is eligible to register for TA.
     * Requirements: Must have a 'finished' internship (KP).
     */
    public function checkEligibility(int $userId): array
    {
        try {
            $profile = ProfileUser::where('user_id', $userId)
                ->where('role', 'mahasiswa')
                ->first();

            if (!$profile) {
                return [
                    'eligible' => false,
                    'reason' => 'Profil mahasiswa tidak ditemukan. Silakan lengkapi profil Anda terlebih dahulu.',
                    'internship' => null,
                ];
            }

            // Check if student already has an active TA registration
            $existingTA = TugasAkhir::where('user_id', $userId)
                ->whereNotIn('status', ['batal'])
                ->first();

            if ($existingTA) {
                return [
                    'eligible' => false,
                    'reason' => 'Anda sudah memiliki pendaftaran Tugas Akhir yang aktif.',
                    'internship' => null,
                    'tugas_akhir' => $existingTA->load(['internship.company', 'internship.theme', 'internship.period', 'pembimbing1', 'pembimbing2']),
                ];
            }

            // Find a finished internship where the student is either the leader or a member
            $studentRecord = \App\Models\Student::where('user_id', $userId)->first();

            if (!$studentRecord) {
                return [
                    'eligible' => false,
                    'reason' => 'Data mahasiswa tidak ditemukan pada sistem KP.',
                    'internship' => null,
                ];
            }

            // Check as leader first
            $finishedInternship = Internship::where('leader_id', $studentRecord->id)
                ->where('status', 'finished')
                ->with(['company', 'theme', 'period', 'supervisor.user'])
                ->first();

            // If not leader, check as member
            if (!$finishedInternship) {
                $memberEntry = InternshipMember::where('student_id', $studentRecord->id)->first();
                if ($memberEntry) {
                    $finishedInternship = Internship::where('id', $memberEntry->internship_id)
                        ->where('status', 'finished')
                        ->with(['company', 'theme', 'period', 'supervisor.user'])
                        ->first();
                }
            }

            if (!$finishedInternship) {
                // Check if they have any KP at all
                $anyInternship = Internship::where('leader_id', $studentRecord->id)->first();
                if (!$anyInternship) {
                    $memberEntry = InternshipMember::where('student_id', $studentRecord->id)->first();
                    if ($memberEntry) {
                        $anyInternship = Internship::find($memberEntry->internship_id);
                    }
                }

                if ($anyInternship) {
                    return [
                        'eligible' => false,
                        'reason' => 'Anda harus lulus KP terlebih dahulu sebelum dapat mendaftar Tugas Akhir. Status KP Anda saat ini: ' . strtoupper($anyInternship->status) . '.',
                        'internship' => null,
                    ];
                }

                return [
                    'eligible' => false,
                    'reason' => 'Anda belum terdaftar pada program Kerja Praktek (KP). Silakan daftar KP terlebih dahulu.',
                    'internship' => null,
                ];
            }

            return [
                'eligible' => true,
                'reason' => null,
                'internship' => $finishedInternship,
                'profile' => $profile,
            ];
        } catch (\Exception $e) {
            Log::error('TA Eligibility check failed', ['user_id' => $userId, 'error' => $e->getMessage()]);
            throw $e;
        }
    }

    /**
     * Register a new Tugas Akhir.
     */
    public function register(int $userId, array $data): TugasAkhir
    {
        try {
            $eligibility = $this->checkEligibility($userId);

            if (!$eligibility['eligible']) {
                throw new \Exception($eligibility['reason']);
            }

            $tugasAkhir = TugasAkhir::create([
                'user_id' => $userId,
                'internship_id' => $eligibility['internship']->id,
                'judul_diajukan' => $data['judul_diajukan'],
                'latar_belakang_singkat' => $data['latar_belakang_singkat'],
                'status' => 'pengajuan',
            ]);

            Log::info('TA registered', [
                'user_id' => $userId,
                'ta_id' => $tugasAkhir->id,
                'internship_id' => $eligibility['internship']->id,
            ]);

            return $tugasAkhir->load(['internship.company', 'internship.theme', 'internship.period']);
        } catch (\Exception $e) {
            Log::error('TA registration failed', ['user_id' => $userId, 'error' => $e->getMessage()]);
            throw $e;
        }
    }

    /**
     * Get student's active TA record.
     */
    public function getMyTA(int $userId): ?TugasAkhir
    {
        try {
            return TugasAkhir::where('user_id', $userId)
                ->whereNotIn('status', ['batal'])
                ->with(['internship.company', 'internship.theme', 'internship.period', 'pembimbing1', 'pembimbing2'])
                ->latest()
                ->first();
        } catch (\Exception $e) {
            Log::error('Fetch TA failed', ['user_id' => $userId, 'error' => $e->getMessage()]);
            throw $e;
        }
    }
}
