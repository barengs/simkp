<?php

namespace App\Services;

use App\Models\Internship;
use App\Models\InternshipMember;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Exception;

class InternshipService
{
    public function register(array $data, int $leaderId)
    {
        DB::beginTransaction();
        try {
            // Automatically create a new company if manually submitted
            if (empty($data['company_id']) && !empty($data['company_name_manual'])) {
                $newCompany = \App\Models\Company::create([
                    'period_id' => $data['period_id'],
                    'name' => $data['company_name_manual'],
                    'address' => $data['company_address_manual'],
                    'contact_person' => $data['company_contact_manual'],
                    'phone' => $data['company_phone_manual'],
                    'is_verified' => false,
                ]);
                $data['company_id'] = $newCompany->id;
            }

            $internshipData = [
                'leader_id' => $leaderId,
                'period_id' => $data['period_id'],
                'company_id' => $data['company_id'] ?: null,
                'company_name_manual' => $data['company_name_manual'] ?? null,
                'company_address_manual' => $data['company_address_manual'] ?? null,
                'company_contact_manual' => $data['company_contact_manual'] ?? null,
                'company_phone_manual' => $data['company_phone_manual'] ?? null,
                'theme_id' => $data['theme_id'],
                'status' => 'submitted', // Auto submit on register
            ];

            // Handle File Uploads
            if (isset($data['proposal'])) {
                $internshipData['proposal_url'] = $data['proposal']->store('proposals', 'public');
            }
            if (isset($data['krs'])) {
                $internshipData['krs_url'] = $data['krs']->store('krs', 'public');
            }
            if (isset($data['ktp'])) {
                $internshipData['ktp_url'] = $data['ktp']->store('ktp', 'public');
            }
            if (isset($data['surat_rekomendasi'])) {
                $internshipData['surat_rekomendasi_url'] = $data['surat_rekomendasi']->store('rekomendasi', 'public');
            }

            $internship = Internship::create($internshipData);

            // Add Leader as Member
            InternshipMember::create([
                'internship_id' => $internship->id,
                'student_id' => $leaderId,
            ]);

            // Add Other Members
            if (isset($data['members']) && is_array($data['members'])) {
                foreach ($data['members'] as $studentId) {
                    if ($studentId != $leaderId) {
                        InternshipMember::create([
                            'internship_id' => $internship->id,
                            'student_id' => $studentId,
                        ]);
                    }
                }
            }

            DB::commit();
            return $internship;
        } catch (Exception $e) {
            DB::rollBack();
            Log::error("Failed to register internship: " . $e->getMessage());
            throw $e;
        }
    }

    public function getStudentInternship(int $studentId)
    {
        return Internship::where('leader_id', $studentId)
            ->orWhereHas('members', function ($query) use ($studentId) {
                $query->where('student_id', $studentId);
            })
            ->with(['leader', 'period', 'company', 'theme', 'supervisor', 'students'])
            ->first();
    }

    // --- ADMIN METHODS ---

    public function getSubmittedInternships()
    {
        return Internship::with(['leader', 'period', 'company', 'theme', 'supervisor', 'students'])
            ->where('status', 'submitted')
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function getApprovedInternships()
    {
        return Internship::with(['leader', 'period', 'company', 'theme', 'supervisor', 'students'])
            ->where('status', 'approved')
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function approveInternship(int $id)
    {
        $internship = Internship::findOrFail($id);
        $internship->status = 'approved';
        $internship->save();
        Log::info("Internship approved: " . $internship->id);
        return $internship;
    }

    public function rejectInternship(int $id, string $note)
    {
        $internship = Internship::findOrFail($id);
        $internship->status = 'rejected';
        $internship->rejection_note = $note;
        $internship->save();
        Log::info("Internship rejected: " . $internship->id . " Reason: " . $note);
        return $internship;
    }

    public function assignSupervisor(int $id, int $supervisorId)
    {
        $internship = Internship::findOrFail($id);
        $internship->supervisor_id = $supervisorId;
        $internship->status = 'ongoing';
        $internship->save();
        Log::info("Internship supervisor assigned: " . $internship->id . " Supervisor: " . $supervisorId);
        return $internship;
    }

    public function getInternshipsForUser($user)
    {
        $query = Internship::with(['leader.user', 'period', 'company', 'theme', 'supervisor.user', 'students.user']);

        if ($user->role === 'dosen') {
            $lecturerId = $user->lecturer->id ?? null;
            $query->where('supervisor_id', $lecturerId);
        } elseif ($user->role !== 'admin') {
            return collect(); // Restrict others
        }

        return $query->orderBy('created_at', 'desc')->get();
    }
}
