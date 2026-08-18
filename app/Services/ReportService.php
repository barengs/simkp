<?php

namespace App\Services;

use App\Models\Report;
use App\Models\KpGroup;
use Illuminate\Support\Facades\DB;

class ReportService
{
    public function getStats(array $params = []): array
    {
        $query = Report::query();
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
        $rejected = $counts['rejected'] ?? 0;

        return [
            'total' => $pending + $approved + $rejected,
            'pending' => $pending,
            'approved' => $approved,
            'rejected' => $rejected,
        ];
    }

    public function getPaginated(array $params)
    {
        $reportTable = (new Report)->getTable();
        $query = Report::query()
            ->select([
                "{$reportTable}.id",
                "{$reportTable}.kp_group_id",
                "{$reportTable}.student_id",
                "{$reportTable}.title",
                "{$reportTable}.description",
                "{$reportTable}.file_url",
                "{$reportTable}.status",
                "{$reportTable}.rejection_note",
                "{$reportTable}.created_at"
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
            $query->whereIn("{$reportTable}.kp_group_id", $params['kp_group_ids']);
        }

        // Filter by specific group_id
        if (!empty($params['kp_group_id'])) {
            $query->where("{$reportTable}.kp_group_id", $params['kp_group_id']);
        }

        if (!empty($params['search'])) {
            $search = $params['search'];
            $query->where(function($q) use ($search, $reportTable) {
                $q->where("{$reportTable}.title", 'like', "%{$search}%")
                  ->orWhereHas('student.user', fn ($sq) => $sq->where('name', 'like', "%{$search}%"))
                  ->orWhereHas('kpGroup.kpCompany', fn ($cq) => $cq->where('name', 'like', "%{$search}%"));
            });
        }

        if (!empty($params['status'])) {
            $query->where("{$reportTable}.status", $params['status']);
        }

        $sortBy = $params['sort_by'] ?? 'created_at';
        $sortDirection = $params['sort_direction'] ?? 'desc';
        $allowedSorts = ['created_at', 'status'];

        if (in_array($sortBy, $allowedSorts)) {
            $query->orderBy("{$reportTable}.{$sortBy}", $sortDirection);
        } else {
            $query->orderBy("{$reportTable}.created_at", 'desc');
        }

        $perPage = isset($params['per_page']) ? (int)$params['per_page'] : 10;
        return $query->paginate($perPage);
    }

    public function getAll(): \Illuminate\Database\Eloquent\Collection
    {
        return Report::select(['id', 'kp_group_id', 'student_id', 'title', 'description', 'file_url', 'status', 'rejection_note', 'created_at'])
            ->with([
                'student' => fn($q) => $q->select(['id', 'user_id', 'nim']),
                'student.user' => fn($q) => $q->select(['id', 'name']),
                'kpGroup' => fn($q) => $q->select(['id', 'kp_company_id']),
                'kpGroup.kpCompany' => fn($q) => $q->select(['id', 'name'])
            ])->get();
    }

    public function getByKpGroup(int $kpGroupId): \Illuminate\Database\Eloquent\Collection
    {
        return Report::select(['id', 'kp_group_id', 'student_id', 'title', 'description', 'file_url', 'status', 'rejection_note', 'created_at'])
            ->with([
                'student' => fn($q) => $q->select(['id', 'user_id', 'nim']),
                'student.user' => fn($q) => $q->select(['id', 'name']),
                'kpGroup' => fn($q) => $q->select(['id', 'kp_company_id']),
                'kpGroup.kpCompany' => fn($q) => $q->select(['id', 'name'])
            ])
            ->where('kp_group_id', $kpGroupId)
            ->orderByDesc('created_at')
            ->get();
    }

    public function getByKpGroupIds(array $kpGroupIds): \Illuminate\Database\Eloquent\Collection
    {
        return Report::select(['id', 'kp_group_id', 'student_id', 'title', 'description', 'file_url', 'status', 'rejection_note', 'created_at'])
            ->with([
                'student' => fn($q) => $q->select(['id', 'user_id', 'nim']),
                'student.user' => fn($q) => $q->select(['id', 'name']),
                'kpGroup' => fn($q) => $q->select(['id', 'kp_company_id']),
                'kpGroup.kpCompany' => fn($q) => $q->select(['id', 'name'])
            ])
            ->whereIn('kp_group_id', $kpGroupIds)
            ->orderByDesc('created_at')
            ->get();
    }

    public function getById(int $id): Report
    {
        return Report::select(['id', 'kp_group_id', 'student_id', 'title', 'description', 'file_url', 'status', 'rejection_note', 'created_at'])
            ->with([
                'student' => fn($q) => $q->select(['id', 'user_id', 'nim']),
                'student.user' => fn($q) => $q->select(['id', 'name']),
                'kpGroup' => fn($q) => $q->select(['id', 'kp_company_id']),
                'kpGroup.kpCompany' => fn($q) => $q->select(['id', 'name'])
            ])
            ->findOrFail($id);
    }

    public function getByStudent(int $studentId): \Illuminate\Database\Eloquent\Collection
    {
        return Report::select(['id', 'kp_group_id', 'student_id', 'title', 'description', 'file_url', 'status', 'rejection_note', 'created_at'])
            ->with([
                'student' => fn($q) => $q->select(['id', 'user_id', 'nim']),
                'student.user' => fn($q) => $q->select(['id', 'name']),
                'kpGroup' => fn($q) => $q->select(['id', 'kp_company_id']),
                'kpGroup.kpCompany' => fn($q) => $q->select(['id', 'name'])
            ])
            ->where('student_id', $studentId)
            ->orderByDesc('created_at')
            ->get();
    }

    public function create(array $data): Report
    {
        return Report::create($data);
    }

    public function update(int $id, array $data): Report
    {
        $report = Report::findOrFail($id);
        $report->update($data);
        return $report->fresh(['kpGroup', 'student.user']);
    }

    public function delete(int $id): bool
    {
        Report::destroy($id);
        return true;
    }
}
