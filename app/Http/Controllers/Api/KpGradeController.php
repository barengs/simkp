<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreKpGradeRequest;
use App\Http\Requests\StoreGroupKpGradeRequest;
use App\Http\Requests\UpdateKpGradeRequest;
use App\Http\Resources\KpGradeResource;
use App\Http\Resources\KpGroupResource;
use App\Services\KpGradeService;
use Illuminate\Http\Request;

class KpGradeController extends Controller
{
    public function __construct(
        private readonly KpGradeService $kpGradeService
    ) {
        $this->middleware('auth:sanctum');
    }

    public function index(Request $request)
    {
        $user = $request->user();

        if ($user->can('kp.nilai')) {
            $groupId = $request->query('group_id');

            if ($groupId) {
                return response()->json(
                    KpGradeResource::collection($this->kpGradeService->getByKpGroup((int) $groupId))
                );
            }

            if ($user->hasRole('dosen')) {
                $lecturerId = optional($user->lecturer)->id;

                if (!$lecturerId) {
                    return response()->json([]);
                }

                $supervisedGroupIds = \App\Models\KpGroupMember::query()
                    ->whereNotNull('supervisor_lecturer_id')
                    ->where('supervisor_lecturer_id', $lecturerId)
                    ->pluck('kp_group_id')
                    ->unique()
                    ->toArray();

                if (empty($supervisedGroupIds)) {
                    return response()->json([]);
                }

                return response()->json(
                    KpGradeResource::collection($this->kpGradeService->getByKpGroupIds($supervisedGroupIds))
                );
            }

            return response()->json(KpGradeResource::collection($this->kpGradeService->getPaginated($request->all())));
        }

        $student = $user->student;
        if (!$student) {
            return response()->json([]);
        }

        $memberIds = $student->kpGroupMembers()->pluck('id')->toArray();

        return response()->json(
            KpGradeResource::collection(
                \App\Models\KpGrade::with([
                    'evaluationCriteria',
                    'kpGroupMember.kpGroup.kpCompany',
                    'kpGroupMember.kpGroup.academicPeriod',
                    'kpGroupMember.kpGroup.kpTheme',
                    'kpGroupMember.supervisor.user',
                    'kpGroupMember.kpGroup.members.student.user',
                ])
                    ->whereIn('kp_group_member_id', $memberIds)
                    ->get()
            )
        );
    }

    public function store(StoreKpGradeRequest $request)
    {
        $this->authorize('create', \App\Models\KpGrade::class);

        $data = $request->validated();

        $grade = $this->kpGradeService->create($data);

        return response()->json(new KpGradeResource($grade), 201);
    }

    public function show(string $id)
    {
        $gradeId = (int) $id;

        if ($gradeId <= 0) {
            return response()->json(['message' => 'Data nilai tidak ditemukan'], 404);
        }

        $grade = $this->kpGradeService->getById($gradeId);
        $this->authorize('view', $grade);

        return response()->json(new KpGradeResource($grade));
    }

    public function update(UpdateKpGradeRequest $request, int $id)
    {
        $grade = $this->kpGradeService->getById($id);
        $this->authorize('update', $grade);

        $data = $request->validated();

        $updated = $this->kpGradeService->update($id, $data);

        return response()->json(new KpGradeResource($updated));
    }

    public function destroy(int $id)
    {
        $grade = $this->kpGradeService->getById($id);
        $this->authorize('delete', $grade);

        $this->kpGradeService->delete($id);

        return response()->json(['message' => 'Data nilai berhasil dihapus']);
    }

    public function storeGroupGrade(StoreGroupKpGradeRequest $request)
    {
        $user = $request->user();

        $lecturerId = optional($user->lecturer)->id;
        $isSupervisor = \App\Models\KpGroupMember::where('kp_group_id', $request->kp_group_id)
            ->where('supervisor_lecturer_id', $lecturerId)
            ->exists();

        $canGrade = $isSupervisor
            || $user->hasAnyRole(['admin', 'koordinator'])
            || $user->can('master-data.manage')
            || $user->can('kp.nilai');

        if (!$canGrade) {
            abort(403, 'Anda tidak diizinkan menilai kelompok ini.');
        }

        $grades = $this->kpGradeService->createGroupGrade($request->kp_group_id, $request->validated());

        return response()->json(
            KpGradeResource::collection(collect($grades)),
            201
        );
    }

    public function getSupervisedGroups()
    {
        $user = request()->user();

        if (!$user->hasAnyRole(['admin', 'koordinator', 'dosen']) && !$user->can('kp.nilai')) {
            abort(403, 'Anda tidak diizinkan mengakses data ini.');
        }

        $canViewAll = $user->hasAnyRole(['admin', 'koordinator']) || $user->can('master-data.manage');
        $lecturerId = optional($user->lecturer)->id;

        $query = \App\Models\KpGroup::whereHas('reports', function ($q) {
            $q->where('status', 'approved');
        })
        ->with(['members.student.user', 'members.supervisor.user', 'reports', 'kpCompany', 'academicPeriod']);

        // Jika dosen murni (bukan admin dan bukan koordinator), tampilkan kelompok yang dibimbingnya
        if (!$canViewAll && $user->hasRole('dosen')) {
            if (!$lecturerId) {
                return response()->json([]);
            }
            $query->whereHas('members', function ($q) use ($lecturerId) {
                $q->where('supervisor_lecturer_id', $lecturerId)
                  ->where('status', 'active');
            });
        }

        $groups = $query->orderBy('created_at', 'desc')->get();

        return response()->json(KpGroupResource::collection($groups));
    }
}
