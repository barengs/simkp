<?php

namespace App\Services;

use App\Models\Report;
use App\Models\KpGroup;
use Illuminate\Support\Facades\DB;

class ReportService
{
    public function getPaginated(array $params)
    {
        $query = Report::with([
            'kpGroup.academicPeriod',
            'kpGroup.kpCompany',
            'student.user',
            'kpGroup.members.student.user',
        ]);

        if (!empty($params['search'])) {
            $search = $params['search'];
            $query->whereHas('student.user', fn ($q) => $q->where('name', 'like', "%{$search}%"))
                  ->orWhereHas('kpGroup.kpCompany', fn ($q) => $q->where('name', 'like', "%{$search}%"));
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
        return Report::with([
            'kpGroup.academicPeriod',
            'kpGroup.kpCompany',
            'student.user',
            'kpGroup.members.student.user',
        ])->get();
    }

    public function getByKpGroup(int $kpGroupId): \Illuminate\Database\Eloquent\Collection
    {
        return Report::with(['student.user', 'kpGroup.academicPeriod', 'kpGroup.kpCompany'])
            ->where('kp_group_id', $kpGroupId)
            ->orderByDesc('created_at')
            ->get();
    }

    public function getByKpGroupIds(array $kpGroupIds): \Illuminate\Database\Eloquent\Collection
    {
        return Report::with(['student.user', 'kpGroup.academicPeriod', 'kpGroup.kpCompany'])
            ->whereIn('kp_group_id', $kpGroupIds)
            ->orderByDesc('created_at')
            ->get();
    }

    public function getById(int $id): Report
    {
        return Report::with(['kpGroup.academicPeriod', 'kpGroup.kpCompany', 'student.user'])
            ->findOrFail($id);
    }

    public function getByStudent(int $studentId): \Illuminate\Database\Eloquent\Collection
    {
        return Report::with(['kpGroup.academicPeriod', 'kpGroup.kpCompany'])
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
        try {
            $report = Report::findOrFail($id);
            \Log::info('ReportService update', ['id' => $id, 'data' => $data, 'before_status' => $report->status]);
            $report->update($data);
            $report->refresh();
            \Log::info('ReportService after update', ['id' => $report->id, 'status' => $report->status, 'title' => $report->title]);
            return $report->fresh(['kpGroup', 'student.user']);
        } catch (\Throwable $e) {
            \Log::error('ReportService update error', ['id' => $id, 'error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            throw $e;
        }
    }

    public function delete(int $id): bool
    {
        Report::destroy($id);
        return true;
    }
}
