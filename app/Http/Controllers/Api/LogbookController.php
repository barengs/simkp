<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreLogbookRequest;
use App\Http\Requests\UpdateLogbookRequest;
use App\Http\Resources\LogbookResource;
use App\Services\LogbookService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class LogbookController extends Controller
{
    public function __construct(
        private readonly LogbookService $logbookService
    ) {
        $this->middleware('auth:sanctum');
    }

    public function index(Request $request)
    {
        $user = $request->user();

        if ($user->can('kp.validasi-logbook')) {
            $groupId = $request->query('group_id');

            if ($groupId) {
                return LogbookResource::collection($this->logbookService->getByKpGroup((int) $groupId))
                    ->additional([
                        'meta' => [
                            'stats' => $this->logbookService->getStats(['kp_group_id' => $groupId])
                        ]
                    ]);
            }

            if ($user->hasRole('dosen')) {
                $lecturerId = optional($user->lecturer)->id;

                if (!$lecturerId) {
                    return LogbookResource::collection(collect([]));
                }

                $supervisedGroupIds = \App\Models\KpGroupMember::query()
                    ->whereNotNull('supervisor_lecturer_id')
                    ->where('supervisor_lecturer_id', $lecturerId)
                    ->pluck('kp_group_id')
                    ->unique()
                    ->toArray();

                if (empty($supervisedGroupIds)) {
                    return LogbookResource::collection(collect([]));
                }

                $params = $request->all();
                $params['kp_group_ids'] = $supervisedGroupIds;

                return LogbookResource::collection($this->logbookService->getPaginated($params))
                    ->additional([
                        'meta' => [
                            'stats' => $this->logbookService->getStats($params)
                        ]
                    ]);
            }

            return LogbookResource::collection($this->logbookService->getPaginated($request->all()))
                ->additional([
                    'meta' => [
                        'stats' => $this->logbookService->getStats($request->all())
                    ]
                ]);
        }

        $student = $user->student;
        if (!$student) {
            return response()->json([]);
        }

        $kpGroupId = $student->kpGroupMembers()->where('status', 'active')->first()?->kp_group_id ?? 0;

        return LogbookResource::collection($this->logbookService->getByKpGroup($kpGroupId))
            ->additional([
                'meta' => [
                    'stats' => $this->logbookService->getStats(['kp_group_id' => $kpGroupId])
                ]
            ]);
    }

    public function store(StoreLogbookRequest $request)
    {
        $this->authorize('create', \App\Models\Logbook::class);

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
            abort(403, 'Pendaftaran KP Anda belum disetujui. Logbook hanya dapat diisi setelah pendaftaran disetujui.');
        }

        $data = $request->validated();
        $data['student_id'] = $student->id;
        $data['kp_group_id'] = $approvedGroup->kp_group_id;

        if ($request->hasFile('attachment')) {
            $data['attachment'] = $request->file('attachment')->store('logbooks', 'public');
        }

        if ($request->hasFile('evidence_photo')) {
            $data['evidence_photo'] = $request->file('evidence_photo')->store('logbooks', 'public');
        }

        $logbook = $this->logbookService->create($data);

        return response()->json(new LogbookResource($logbook), 201);
    }

    public function show(int $id)
    {
        $logbook = $this->logbookService->getById($id);
        $this->authorize('view', $logbook);

        return response()->json(new LogbookResource($logbook));
    }

    public function update(UpdateLogbookRequest $request, int $id)
    {
        $logbook = $this->logbookService->getById($id);
        $this->authorize('update', $logbook);

        $data = $request->validated();

        if ($request->hasFile('attachment')) {
            if ($logbook->attachment && Storage::disk('public')->exists($logbook->attachment)) {
                Storage::disk('public')->delete($logbook->attachment);
            }
            $data['attachment'] = $request->file('attachment')->store('logbooks', 'public');
        }

        if ($request->hasFile('evidence_photo')) {
            if ($logbook->evidence_photo && Storage::disk('public')->exists($logbook->evidence_photo)) {
                Storage::disk('public')->delete($logbook->evidence_photo);
            }
            $data['evidence_photo'] = $request->file('evidence_photo')->store('logbooks', 'public');
        }

        $updated = $this->logbookService->update($id, $data);

        return response()->json(new LogbookResource($updated));
    }

    public function destroy(int $id)
    {
        $logbook = $this->logbookService->getById($id);
        $this->authorize('delete', $logbook);

        if ($logbook->attachment && Storage::disk('public')->exists($logbook->attachment)) {
            Storage::disk('public')->delete($logbook->attachment);
        }

        if ($logbook->evidence_photo && Storage::disk('public')->exists($logbook->evidence_photo)) {
            Storage::disk('public')->delete($logbook->evidence_photo);
        }

        $this->logbookService->delete($id);

        return response()->json(['message' => 'Data logbook berhasil dihapus']);
    }
}
