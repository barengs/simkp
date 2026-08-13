<?php

namespace App\Services;

use App\Models\KpGrade;
use App\Models\KpGroupMember;
use Illuminate\Support\Facades\DB;

class KpGradeService
{
    public function getAll(): \Illuminate\Database\Eloquent\Collection
    {
        return KpGrade::with([
            'kpGroupMember.kpGroup.academicPeriod',
            'kpGroupMember.kpGroup.kpCompany',
            'kpGroupMember.student.user',
            'evaluationCriteria',
        ])->get();
    }

    public function getByKpGroup(int $kpGroupId): \Illuminate\Database\Eloquent\Collection
    {
        return KpGrade::with([
            'kpGroupMember.student.user',
            'evaluationCriteria',
            'kpGroupMember.kpGroup',
        ])
            ->whereHas('kpGroupMember', fn ($q) => $q->where('kp_group_id', $kpGroupId))
            ->orderByDesc('created_at')
            ->get();
    }

    public function getByKpGroupIds(array $kpGroupIds): \Illuminate\Database\Eloquent\Collection
    {
        return KpGrade::with([
            'kpGroupMember.student.user',
            'evaluationCriteria',
            'kpGroupMember.kpGroup',
        ])
            ->whereHas('kpGroupMember', fn ($q) => $q->whereIn('kp_group_id', $kpGroupIds))
            ->orderByDesc('created_at')
            ->get();
    }

    public function getById(int $id): KpGrade
    {
        return KpGrade::with([
            'kpGroupMember.kpGroup.academicPeriod',
            'kpGroupMember.kpGroup.kpCompany',
            'kpGroupMember.student.user',
            'evaluationCriteria',
        ])->findOrFail($id);
    }

    public function getByMember(int $memberId): \Illuminate\Database\Eloquent\Collection
    {
        return KpGrade::with('evaluationCriteria')
            ->where('kp_group_member_id', $memberId)
            ->get();
    }

    public function create(array $data): KpGrade
    {
        return KpGrade::create($data);
    }

    public function update(int $id, array $data): KpGrade
    {
        $grade = KpGrade::findOrFail($id);
        $grade->update($data);
        return $grade->fresh(['kpGroupMember.student.user', 'evaluationCriteria']);
    }

    public function delete(int $id): bool
    {
        KpGrade::destroy($id);
        return true;
    }

    public function getGradedMembers(int $kpGroupId): array
    {
        return KpGrade::whereHas('kpGroupMember', fn ($q) => $q->where('kp_group_id', $kpGroupId))
            ->distinct('kp_group_member_id')
            ->pluck('kp_group_member_id')
            ->toArray();
    }

    public function createGroupGrade(int $kpGroupId, array $data): array
    {
        return DB::transaction(function () use ($kpGroupId, $data) {
            $members = KpGroupMember::where('kp_group_id', $kpGroupId)
                ->where('status', 'active')
                ->get();

            $finalGrade = $this->calculateFinalGrade(
                $data['score_field'] ?? null,
                $data['score_report'] ?? null,
                $data['score_seminar'] ?? null
            );

            $grades = [];
            foreach ($members as $member) {
                $grade = KpGrade::updateOrCreate(
                    ['kp_group_member_id' => $member->id],
                    [
                        'score_field' => $data['score_field'] ?? null,
                        'score_report' => $data['score_report'] ?? null,
                        'score_seminar' => $data['score_seminar'] ?? null,
                        'final_grade' => $finalGrade,
                        'notes' => $data['notes'] ?? null,
                    ]
                );
                $grades[] = $grade;
            }

            $totalActiveMembers = $members->count();
            $gradedCount = KpGrade::whereHas('kpGroupMember', fn ($q) => $q->where('kp_group_id', $kpGroupId))
                ->whereNotNull('final_grade')
                ->distinct('kp_group_member_id')
                ->count('kp_group_member_id');

            if ($totalActiveMembers > 0 && $gradedCount >= $totalActiveMembers) {
                \App\Models\KpGroup::where('id', $kpGroupId)->update(['status' => 'finished']);
            }

            return $grades;
        });
    }

    private function calculateFinalGrade(?float $scoreField, ?float $scoreReport, ?float $scoreSeminar): ?string
    {
        $scores = array_filter([$scoreField, $scoreReport, $scoreSeminar], fn ($v) => $v !== null);

        if (empty($scores)) {
            return null;
        }

        $average = array_sum($scores) / count($scores);

        if ($average >= 80) return 'A';
        if ($average >= 70) return 'B';
        if ($average >= 60) return 'C';
        if ($average >= 50) return 'D';

        return 'E';
    }
}
