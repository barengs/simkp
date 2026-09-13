<?php

namespace App\Services;

use App\Models\KpGroup;
use Illuminate\Support\Facades\DB;

class RegistrationVerificationService
{
    private function baseQuery()
    {
        return KpGroup::query()
            ->select([
                'id',
                'status',
                'rejection_note',
                'document_revision_note',
                'description',
                'academic_period_id',
                'kp_theme_id',
                'kp_company_id',
                'created_at',
                'updated_at',
            ]);
    }

    private function withRelations()
    {
        return [
            'academicPeriod:id,name',
            'kpTheme:id,title',
            'kpCompany:id,name,address',
            'members.student:id,nim,user_id',
            'members.student.user:id,name',
            'members.supervisor:id,name',
            'kpDocuments.documentType:id,name',
        ];
    }

    public function getPaginated(array $params)
    {
        $query = $this->baseQuery()
            ->with($this->withRelations())
            ->whereDoesntHave('members', fn ($q) => $q->whereNotNull('supervisor_lecturer_id'));

        if (!empty($params['search'])) {
            $search = $params['search'];
            $query->where(function ($q) use ($search) {
                $q->whereHas('members.student.user', fn ($uq) => $uq->where('name', 'like', "%{$search}%"))
                  ->orWhereHas('members.student', fn ($sq) => $sq->where('nim', 'like', "%{$search}%"))
                  ->orWhereHas('kpCompany', fn ($cq) => $cq->where('name', 'like', "%{$search}%"));
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
        return $this->baseQuery()
            ->with($this->withRelations())
            ->whereDoesntHave('members', fn ($q) => $q->whereNotNull('supervisor_lecturer_id'))
            ->orderBy('created_at', 'asc')
            ->get();
    }

    public function getById(int $id): KpGroup
    {
        return $this->baseQuery()
            ->with($this->withRelations())
            ->findOrFail($id);
    }

    public function update(int $id, array $data): KpGroup
    {
        return DB::transaction(function () use ($id, $data) {
            $kelompok = KpGroup::findOrFail($id);

            if (isset($data['status'])) {
                $kelompok->status = $data['status'];

                if ($data['status'] === 'approved') {
                    \App\Models\KpGroupMember::where('kp_group_id', $id)
                        ->where('status', 'inactive')
                        ->update(['status' => 'active']);
                }
            }

            if (isset($data['rejection_note'])) {
                $kelompok->rejection_note = $data['rejection_note'];
            }

            if (isset($data['document_revision_note'])) {
                $kelompok->document_revision_note = $data['document_revision_note'];
            }

            $kelompok->save();

            return $this->baseQuery()
                ->with($this->withRelations())
                ->find($kelompok->id);
        });
    }

    public function addMember(int $kpGroupId, int $studentId): KpGroup
    {
        return DB::transaction(function () use ($kpGroupId, $studentId) {
            $kelompok = KpGroup::findOrFail($kpGroupId);

            // Check if student is already a member
            $existingMember = \App\Models\KpGroupMember::where('kp_group_id', $kpGroupId)
                ->where('student_id', $studentId)
                ->first();

            if ($existingMember) {
                throw new \InvalidArgumentException('Mahasiswa sudah menjadi anggota kelompok ini.');
            }

            // Get max members from academic_period (total_members field)
            $academicPeriod = $kelompok->academicPeriod;
            $maxMembers = $academicPeriod?->total_members ?? 5;

            // Count current members
            $currentMembersCount = \App\Models\KpGroupMember::where('kp_group_id', $kpGroupId)->count();

            if ($currentMembersCount >= $maxMembers) {
                throw new \InvalidArgumentException("Maksimal anggota kelompok adalah {$maxMembers} orang.");
            }

            // Add as anggota with inactive status (needs invitation acceptance)
            \App\Models\KpGroupMember::create([
                'kp_group_id' => $kpGroupId,
                'student_id'  => $studentId,
                'role'        => 'anggota',
                'join_date'   => now()->toDateString(),
                'status'      => 'inactive',
            ]);

            return $this->getById($kpGroupId);
        });
    }

    public function removeMember(int $kpGroupId, int $memberId): KpGroup
    {
        return DB::transaction(function () use ($kpGroupId, $memberId) {
            $member = \App\Models\KpGroupMember::where('kp_group_id', $kpGroupId)
                ->where('id', $memberId)
                ->firstOrFail();

            if ($member->role === 'ketua') {
                throw new \InvalidArgumentException('Ketua kelompok tidak dapat dikeluarkan.');
            }

            $member->delete();

            return $this->getById($kpGroupId);
        });
    }
}
