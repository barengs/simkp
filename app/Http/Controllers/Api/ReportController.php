<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreReportRequest;
use App\Http\Requests\UpdateReportRequest;
use App\Http\Resources\ReportResource;
use App\Services\ReportService;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function __construct(
        private readonly ReportService $reportService
    ) {
        $this->middleware('auth:sanctum');
    }

    public function index()
    {
        $user = request()->user();

        if ($user->can('kp.laporan.approve')) {
            $groupId = request()->query('group_id');

            if ($groupId) {
                return response()->json(
                    ReportResource::collection($this->reportService->getByKpGroup((int) $groupId))
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
                    ReportResource::collection($this->reportService->getByKpGroupIds($supervisedGroupIds))
                );
            }

            return response()->json(ReportResource::collection($this->reportService->getAll()));
        }

        $student = $user->student;
        if (!$student) {
            return response()->json([]);
        }

        $groupId = request()->query('group_id');
        if ($groupId) {
            $isMember = \App\Models\KpGroupMember::where('kp_group_id', $groupId)
                ->where('student_id', $student->id)
                ->where('status', 'active')
                ->exists();

            if ($isMember) {
                return response()->json(
                    ReportResource::collection($this->reportService->getByKpGroup((int) $groupId))
                );
            }
        }

        return response()->json(
            ReportResource::collection($this->reportService->getByStudent($student->id))
        );
    }

    public function store(StoreReportRequest $request)
    {
        $this->authorize('create', \App\Models\Report::class);

        $user = $request->user();
        $student = $user->student;

        if (!$student) {
            abort(403, 'Data mahasiswa tidak ditemukan.');
        }

        $approvedGroup = $student->kpGroupMembers()
            ->where('status', 'active')
            ->whereHas('kpGroup', function ($q) {
                $q->where('status', 'approved');
            })
            ->first();

        if (!$approvedGroup) {
            abort(403, 'Pendaftaran KP Anda belum disetujui. Laporan hanya dapat diajukan setelah pendaftaran disetujui.');
        }

        $data = $request->validated();
        $data['student_id'] = $student->id;
        $data['kp_group_id'] = $approvedGroup->kp_group_id;
        $data['status'] = $data['status'] ?? 'pending';

        if ($request->hasFile('file')) {
            $data['file_url'] = $request->file('file')->store('reports', 'public');
        }

        $report = $this->reportService->create($data);

        return response()->json(new ReportResource($report), 201);
    }

    public function show(int $id)
    {
        $report = $this->reportService->getById($id);
        $this->authorize('view', $report);

        return response()->json(new ReportResource($report));
    }

    public function update(UpdateReportRequest $request, int $id)
    {
        $report = $this->reportService->getById($id);
        $this->authorize('update', $report);

        \Log::info('Report update raw request', [
            'id' => $id,
            'all' => $request->all(),
            'has_file' => $request->hasFile('file'),
            'headers' => $request->headers->all(),
        ]);

        $data = $request->validated();

        if ($request->hasFile('file')) {
            $data['file_url'] = $request->file('file')->store('reports', 'public');
        }

        $updated = $this->reportService->update($id, $data);

        if ($updated->status === 'approved') {
            $updated->kpGroup()->update(['status' => 'grading']);
        }

        return response()->json(new ReportResource($updated));
    }

    public function destroy(int $id)
    {
        $report = $this->reportService->getById($id);
        $this->authorize('delete', $report);

        $this->reportService->delete($id);

        return response()->json(['message' => 'Data laporan berhasil dihapus']);
    }
}
