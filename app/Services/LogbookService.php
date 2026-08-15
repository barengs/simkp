<?php

namespace App\Services;

use App\Models\Logbook;
use App\Models\KpGroup;
use Illuminate\Support\Facades\DB;

class LogbookService
{
    public function getAll(): \Illuminate\Database\Eloquent\Collection
    {
        return Logbook::with([
            'kpGroup.academicPeriod',
            'kpGroup.kpCompany',
            'kpGroup.members.student.user',
            'student.user',
        ])->get();
    }

    public function getByKpGroup(int $kpGroupId): \Illuminate\Database\Eloquent\Collection
    {
        return Logbook::with(['student.user', 'kpGroup.academicPeriod', 'kpGroup.kpCompany', 'kpGroup.members.student.user'])
            ->where('kp_group_id', $kpGroupId)
            ->orderBy('date')
            ->get();
    }

    public function getByKpGroupIds(array $kpGroupIds): \Illuminate\Database\Eloquent\Collection
    {
        return Logbook::with(['student.user', 'kpGroup.academicPeriod', 'kpGroup.kpCompany', 'kpGroup.members.student.user'])
            ->whereIn('kp_group_id', $kpGroupIds)
            ->orderBy('date')
            ->get();
    }

    public function getById(int $id): Logbook
    {
        return Logbook::with(['kpGroup.academicPeriod', 'kpGroup.kpCompany', 'student.user'])
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
