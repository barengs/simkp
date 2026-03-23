<?php

namespace App\Services;

use App\Models\Internship;
use App\Models\InternshipMember;
use App\Models\Student;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class InternshipService
{
    public function checkLocationAvailability(string $periodId, string $companyName): bool
    {
        return !Internship::where('period_id', $periodId)
            ->where('company_name_manual', 'like', $companyName)
            ->where('status', '!=', 'rejected')
            ->exists();
    }

    public function getAllInternships(array $filters): Collection
    {
        $query = Internship::select([
            'id',
            'leader_id',
            'company_id',
            'theme_id',
            'period_id',
            'supervisor_id',
            'status',
            'created_at',
            'company_name_manual',
            'proposal_url',
            'krs_url',
            'ktp_url',
            'surat_rekomendasi_url',
            'rejection_note'
        ])
            ->with([
                'leader:id,user_id,nim',
                'leader.user:id,name',
                'company:id,name',
                'theme:id,name',
                'period:id,academic_year,semester',
                'lecturer:id,user_id,nip',
                'lecturer.user:id,name',
                'members:id,internship_id,student_id',
                'members.student:id,user_id,nim',
                'members.student.user:id,name'
            ]);

        if (isset($filters['status'])) {
            $query->whereIn('status', explode(',', $filters['status']));
        }

        if (isset($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->whereHas('leader.user', function ($subQ) use ($search) {
                    $subQ->where('name', 'like', "%{$search}%");
                })
                    ->orWhereHas('leader', function ($subQ) use ($search) {
                        $subQ->where('nim', 'like', "%{$search}%");
                    })
                    ->orWhereHas('company', function ($subQ) use ($search) {
                        $subQ->where('name', 'like', "%{$search}%");
                    });
            });
        }

        return $query->latest()->get();
    }

    public function getStudentInternship(int $studentId): ?Internship
    {
        return Internship::with(['leader.user', 'members.student.user', 'company', 'theme', 'period', 'lecturer.user', 'report', 'evaluation'])
            ->whereHas('members', function ($q) use ($studentId) {
                $q->where('student_id', $studentId);
            })
            ->latest()
            ->first();
    }

    public function getStudentHistory(int $studentId): Collection
    {
        return Internship::with(['leader.user', 'members.student.user', 'company', 'theme', 'period', 'lecturer.user', 'report', 'evaluation'])
            ->whereHas('members', function ($q) use ($studentId) {
                $q->where('student_id', $studentId);
            })
            ->latest()
            ->get();
    }

    public function registerInternship(Student $leader, array $data, array $files): Internship
    {
        return DB::transaction(function () use ($leader, $data, $files) {
            // Check existing
            $existing = Internship::whereHas('members', function ($q) use ($leader) {
                $q->where('student_id', $leader->id);
            })->where('period_id', $data['period_id'])->first();

            if ($existing && !in_array($existing->status, ['draft', 'rejected'])) {
                throw ValidationException::withMessages(['message' => 'Anda sudah terdaftar di kelompok lain.']);
            }

            $internship = $existing ?? new Internship();

            if (!$existing) {
                $internship->leader_id = $leader->id;
            } elseif ($internship->leader_id != $leader->id && $internship->status != 'rejected') {
                // Logic based on original controller - allowing overwrite if rejected or same leader
            }

            $internship->period_id = $data['period_id'];
            $internship->theme_id = $data['theme_id'];
            $internship->status = $data['status'];

            if ($data['company_action'] === 'selection') {
                $internship->company_id = $data['company_id'];
                $internship->company_name_manual = null;
            } else {
                $internship->company_id = null;
                $internship->company_name_manual = $data['company_name_manual'];
            }

            // Handle Files
            $fileColumns = [
                'proposal' => 'proposal_url',
                'krs' => 'krs_url',
                'ktm' => 'ktp_url',
                'recommendation' => 'surat_rekomendasi_url'
            ];

            foreach ($fileColumns as $input => $column) {
                if (isset($files[$input]) && $files[$input] instanceof UploadedFile) {
                    if ($internship->$column) {
                        Storage::disk('public')->delete(str_replace('/storage/', '', $internship->$column));
                    }
                    $path = $files[$input]->store('internships', 'public');
                    $internship->$column = Storage::url($path);
                }
            }

            $internship->save();

            // Sync Members
            $this->syncMembers($internship, $leader, $data['members'] ?? []);

            return $internship;
        });
    }

    protected function syncMembers(Internship $internship, Student $leader, array $memberNims): void
    {
        $memberIds = [$leader->id];

        foreach ($memberNims as $nim) {
            $member = Student::where('nim', $nim)->first();
            if ($member) {
                // Check if member is busy
                $isBusy = InternshipMember::where('student_id', $member->id)
                    ->whereHas('internship', function ($q) use ($internship) {
                        $q->where('period_id', $internship->period_id)
                            ->where('id', '!=', $internship->id);
                    })->exists();

                if ($isBusy) {
                    throw ValidationException::withMessages(['members' => "Mahasiswa dengan NIM $nim sudah terdaftar di kelompok lain."]);
                }
                $memberIds[] = $member->id;
            }
        }

        InternshipMember::where('internship_id', $internship->id)->delete();

        foreach (array_unique($memberIds) as $mid) {
            InternshipMember::create([
                'internship_id' => $internship->id,
                'student_id' => $mid
            ]);
        }
    }

    public function updateStatus(Internship $internship, string $status, ?string $notes): void
    {
        $internship->status = $status;
        $internship->rejection_note = $notes;
        $internship->save();
    }

    public function assignSupervisor(Internship $internship, int $lecturerId): void
    {
        $internship->supervisor_id = $lecturerId;
        $internship->status = 'ongoing';
        $internship->save();
    }

    public function assignTeacher(array $internshipIds, int $teacherId): void
    {
        Internship::whereIn('id', $internshipIds)
            ->update(['supervisor_id' => $teacherId, 'status' => 'ongoing']);
    }
}
