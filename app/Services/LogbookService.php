<?php

namespace App\Services;

use App\Models\Logbook;
use App\Models\KpGroup;
use Illuminate\Support\Facades\DB;

class LogbookService
{
    public function getStats(array $params = []): array
    {
        $query = Logbook::query();
        if (!empty($params['kp_group_ids'])) {
            $query->whereIn('kp_group_id', $params['kp_group_ids']);
        }
        if (!empty($params['kp_group_id'])) {
            $query->where('kp_group_id', $params['kp_group_id']);
        }

        $counts = $query->selectRaw('status, count(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();

        $pending = $counts['pending'] ?? 0;
        $approved = $counts['approved'] ?? 0;

        return [
            'total' => $pending + $approved,
            'pending' => $pending,
            'approved' => $approved,
        ];
    }

    public function getPaginated(array $params)
    {
        $logbookTable = (new Logbook)->getTable();
        $query = Logbook::query()
            ->select([
                "{$logbookTable}.id",
                "{$logbookTable}.student_id",
                "{$logbookTable}.kp_group_id",
                "{$logbookTable}.date",
                "{$logbookTable}.activity",
                "{$logbookTable}.evidence_photo",
                "{$logbookTable}.status"
            ])
            ->with([
                'student' => function ($q) {
                    $q->select(['id', 'user_id', 'nim']);
                },
                'student.user' => function ($q) {
                    $q->select(['id', 'name']);
                },
                'kpGroup' => function ($q) {
                    $q->select(['id', 'kp_company_id']);
                },
                'kpGroup.kpCompany' => function ($q) {
                    $q->select(['id', 'name']);
                }
            ]);

        // Filter by kp_group_ids (used for supervisor lecturer bimbingan)
        if (!empty($params['kp_group_ids'])) {
            $query->whereIn("{$logbookTable}.kp_group_id", $params['kp_group_ids']);
        }

        // Filter by specific group_id
        if (!empty($params['kp_group_id'])) {
            $query->where("{$logbookTable}.kp_group_id", $params['kp_group_id']);
        }

        // Search
        if (!empty($params['search'])) {
            $search = $params['search'];
            $query->where(function ($q) use ($search, $logbookTable) {
                $q->where("{$logbookTable}.activity", 'like', "%{$search}%")
                  ->orWhereHas('student.user', fn ($sq) => $sq->where('name', 'like', "%{$search}%"))
                  ->orWhereHas('kpGroup.kpCompany', fn ($cq) => $cq->where('name', 'like', "%{$search}%"));
            });
        }

        if (!empty($params['status'])) {
            $query->where("{$logbookTable}.status", $params['status']);
        }

        $sortBy = $params['sort_by'] ?? 'date';
        $sortDirection = $params['sort_direction'] ?? 'desc';
        $allowedSorts = ['date', 'status'];

        if (in_array($sortBy, $allowedSorts)) {
            $query->orderBy("{$logbookTable}.{$sortBy}", $sortDirection);
        } else {
            $query->orderBy("{$logbookTable}.date", 'desc');
        }

        $perPage = isset($params['per_page']) ? (int)$params['per_page'] : 10;
        return $query->paginate($perPage);
    }

    public function getAll(): \Illuminate\Database\Eloquent\Collection
    {
        return Logbook::select(['id', 'student_id', 'kp_group_id', 'date', 'activity', 'evidence_photo', 'status'])
            ->with([
                'student' => fn($q) => $q->select(['id', 'user_id', 'nim']),
                'student.user' => fn($q) => $q->select(['id', 'name']),
                'kpGroup' => fn($q) => $q->select(['id', 'kp_company_id']),
                'kpGroup.kpCompany' => fn($q) => $q->select(['id', 'name'])
            ])->get();
    }

    public function getByKpGroup(int $kpGroupId): \Illuminate\Database\Eloquent\Collection
    {
        return Logbook::select(['id', 'student_id', 'kp_group_id', 'date', 'activity', 'evidence_photo', 'status'])
            ->with([
                'student' => fn($q) => $q->select(['id', 'user_id', 'nim']),
                'student.user' => fn($q) => $q->select(['id', 'name']),
                'kpGroup' => fn($q) => $q->select(['id', 'kp_company_id']),
                'kpGroup.kpCompany' => fn($q) => $q->select(['id', 'name'])
            ])
            ->where('kp_group_id', $kpGroupId)
            ->orderBy('date')
            ->get();
    }

    public function getByKpGroupIds(array $kpGroupIds): \Illuminate\Database\Eloquent\Collection
    {
        return Logbook::select(['id', 'student_id', 'kp_group_id', 'date', 'activity', 'evidence_photo', 'status'])
            ->with([
                'student' => fn($q) => $q->select(['id', 'user_id', 'nim']),
                'student.user' => fn($q) => $q->select(['id', 'name']),
                'kpGroup' => fn($q) => $q->select(['id', 'kp_company_id']),
                'kpGroup.kpCompany' => fn($q) => $q->select(['id', 'name'])
            ])
            ->whereIn('kp_group_id', $kpGroupIds)
            ->orderBy('date')
            ->get();
    }

    public function getById(int $id): Logbook
    {
        return Logbook::select(['id', 'student_id', 'kp_group_id', 'date', 'activity', 'evidence_photo', 'status'])
            ->with([
                'student' => fn($q) => $q->select(['id', 'user_id', 'nim']),
                'student.user' => fn($q) => $q->select(['id', 'name']),
                'kpGroup' => fn($q) => $q->select(['id', 'kp_company_id']),
                'kpGroup.kpCompany' => fn($q) => $q->select(['id', 'name'])
            ])
            ->findOrFail($id);
    }

    public function create(array $data): Logbook
    {
        return Logbook::create($data);
    }

    public function update(int $id, array $data): Logbook
    {
        $logbook = Logbook::findOrFail($id);
        $logbook->update($data);
        return $logbook->fresh(['kpGroup', 'student.user']);
    }

    public function delete(int $id): bool
    {
        Logbook::destroy($id);
        return true;
    }
}
