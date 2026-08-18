<?php

namespace App\Services;

use App\Models\KpGroup;
use App\Models\KpGroupMember;
use App\Models\Student;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class KpGroupService
{
    private function withRelations()
    {
        return KpGroup::with([
            'academicPeriod',
            'kpTheme',
            'kpCompany',
            'members.student.user',
            'members.supervisor',
            'kpDocuments.documentType',
        ]);
    }

    public function getPaginated(array $params)
    {
        $query = $this->withRelations()
            ->whereDoesntHave('members', fn ($q) => $q->whereNotNull('supervisor_lecturer_id'));

        if (!empty($params['search'])) {
            $search = $params['search'];
            $query->where(function ($q) use ($search) {
                $q->whereHas('kpCompany', fn ($cq) => $cq->where('name', 'like', "%{$search}%"))
                  ->orWhereHas('members.supervisor', fn ($sq) => $sq->where('name', 'like', "%{$search}%"));
            });
        }

        if (!empty($params['status'])) {
            $query->where('status', $params['status']);
        }

        $sortBy = $params['sort_by'] ?? 'created_at';
        $sortDirection = $params['sort_direction'] ?? 'desc';
        $allowedSorts = ['created_at', 'status'];

        if (in_array($sortBy, $allowedSorts)) {
            $query->orderBy($sortBy, $sortDirection);
        }

        $perPage = isset($params['per_page']) ? (int)$params['per_page'] : 10;
        return $query->paginate($perPage);
    }

    public function getAll(): \Illuminate\Database\Eloquent\Collection
    {
        return $this->withRelations()
            ->whereDoesntHave('members', fn ($q) => $q->whereNotNull('supervisor_lecturer_id'))
            ->get();
    }

    public function getById(int $id): KpGroup
    {
        return $this->withRelations()->findOrFail($id);
    }

    /**
     * Ambil kelompok milik mahasiswa tertentu (by student.id).
     */
    public function getByStudent(int $studentId): \Illuminate\Database\Eloquent\Collection
    {
        return $this->withRelations()
            ->whereHas('members', fn ($q) => $q->where('student_id', $studentId))
            ->get();
    }

    /**
     * Buat kelompok baru.
     * - Mahasiswa pembuat otomatis menjadi ketua (role = 'ketua').
     */
    public function create(array $data): KpGroup
    {
        return DB::transaction(function () use ($data) {
            $kelompok = KpGroup::create([
                'start_date'         => $data['start_date'] ?? null,
                'end_date'           => $data['end_date'] ?? null,
                'kp_company_id'      => $data['kp_company_id'],
                'kp_theme_id'        => $data['kp_theme_id'],
                'academic_period_id' => $data['academic_period_id'],
                'status'             => 'submitted',
                'description'        => $data['description'] ?? null,
            ]);

            // Ketua: user yang membuat (ketua_student_id wajib ada di payload)
            if (!empty($data['ketua_student_id'])) {
                KpGroupMember::create([
                    'kp_group_id' => $kelompok->id,
                    'student_id'  => $data['ketua_student_id'],
                    'role'        => 'ketua',
                    'join_date'   => now()->toDateString(),
                    'status'      => 'active',
                ]);
            }

            // Anggota tambahan — dibuat sebagai undangan (inactive) terlebih dahulu
            foreach (($data['anggota_ids'] ?? []) as $studentId) {
                if (!empty($data['ketua_student_id']) && $studentId == $data['ketua_student_id']) {
                    continue;
                }
                KpGroupMember::create([
                    'kp_group_id' => $kelompok->id,
                    'student_id'  => $studentId,
                    'role'        => 'anggota',
                    'join_date'   => now()->toDateString(),
                    'status'      => 'inactive',
                ]);
            }

            return $this->withRelations()->find($kelompok->id);
        });
    }

    public function update(int $id, array $data): KpGroup
    {
        return DB::transaction(function () use ($id, $data) {
            $kelompok = KpGroup::findOrFail($id);

            // Handle status update (for verifikasi)
            if (isset($data['status'])) {
                $kelompok->status = $data['status'];

                if ($data['status'] === 'approved') {
                    KpGroupMember::where('kp_group_id', $id)
                        ->where('status', 'inactive')
                        ->update(['status' => 'active']);
                }
            }

            // Handle rejection note (for verifikasi)
            if (isset($data['rejection_note'])) {
                $kelompok->rejection_note = $data['rejection_note'];
            }

            // Update other fields only if provided
            $kelompok->update(array_filter([
                'start_date'         => $data['start_date']         ?? null,
                'end_date'           => $data['end_date']           ?? null,
                'kp_company_id'      => $data['kp_company_id']      ?? null,
                'kp_theme_id'        => $data['kp_theme_id']         ?? null,
                'academic_period_id' => $data['academic_period_id']  ?? null,
                'description'        => $data['description']         ?? null,
            ], fn ($v) => $v !== null));

            // Sync anggota jika disuplai
            if (array_key_exists('anggota_ids', $data)) {
                // Pertahankan ketua, ganti anggota biasa
                KpGroupMember::where('kp_group_id', $id)
                    ->where('role', 'anggota')
                    ->delete();

                foreach ($data['anggota_ids'] as $studentId) {
                    // Skip jika sudah jadi ketua
                    if (KpGroupMember::where('kp_group_id', $id)
                        ->where('student_id', $studentId)
                        ->exists()) {
                        continue;
                    }
                    KpGroupMember::create([
                        'kp_group_id' => $id,
                        'student_id'  => $studentId,
                        'role'        => 'anggota',
                        'join_date'   => now()->toDateString(),
                        'status'      => 'inactive',
                    ]);
                }
            }

            return $this->withRelations()->find($kelompok->id);
        });
    }

    public function delete(int $id): bool
    {
        return DB::transaction(function () use ($id) {
            KpGroupMember::where('kp_group_id', $id)->delete();
            KpGroup::destroy($id);
            return true;
        });
    }

    public function acceptInvitation(int $kpGroupId, int $studentId): KpGroupMember
    {
        $member = KpGroupMember::where('kp_group_id', $kpGroupId)
            ->where('student_id', $studentId)
            ->where('role', 'anggota')
            ->firstOrFail();

        $member->update(['status' => 'active']);

        return $member->fresh(['kpGroup', 'student']);
    }

    public function declineInvitation(int $kpGroupId, int $studentId): bool
    {
        $member = KpGroupMember::where('kp_group_id', $kpGroupId)
            ->where('student_id', $studentId)
            ->where('role', 'anggota')
            ->firstOrFail();

        $member->delete();

        return true;
    }

    // ── Helper ────────────────────────────────────────────────────────────────

    private function generateCode(int $periodId): string
    {
        $count  = KpGroup::where('academic_period_id', $periodId)->count() + 1;
        return 'KP-' . $periodId . '-' . str_pad($count, 3, '0', STR_PAD_LEFT);
    }
}
