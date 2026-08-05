<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Logbook;
use App\Services\LogbookService;
use App\Http\Requests\LogbookRequest;
use App\Http\Resources\LogbookResource;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class LogbookController extends Controller
{
    protected $logbookService;

    public function __construct(LogbookService $logbookService)
    {
        $this->logbookService = $logbookService;
    }

    /**
     * Display a listing of the logbooks.
     * Authorization handled by LogbookPolicy::viewAny.
     */
    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Logbook::class);

        $logbooks = $this->logbookService->getAllLogbooks();

        return LogbookResource::collection($logbooks);
    }

    /**
     * Store a newly created logbook.
     * Authorization handled by LogbookPolicy::create.
     */
    public function store(LogbookRequest $request): JsonResponse
    {
        $this->authorize('create', Logbook::class);

        $logbook = $this->logbookService->createLogbook($request->validated());
        $logbook->load('internship.company', 'internship.leader');

        return new LogbookResource($logbook);
    }

    /**
     * Display the specified logbook.
     * Authorization handled by LogbookPolicy::view.
     */
    public function show(Logbook $logbook): JsonResponse
    {
        $this->authorize('view', $logbook);

        $logbook->load('internship.company', 'internship.leader');

        return new LogbookResource($logbook);
    }

    /**
     * Update the specified logbook.
     * Authorization handled by LogbookPolicy::update.
     */
    public function update(LogbookRequest $request, Logbook $logbook): JsonResponse
    {
        $this->authorize('update', $logbook);

        if ($logbook->status === 'approved') {
            return response()->json(['message' => 'Cannot modify an approved logbook.'], 403);
        }

        $updated = $this->logbookService->updateLogbook($logbook, $request->validated());
        $updated->load('internship.company', 'internship.leader');

        return new LogbookResource($updated);
    }

    /**
     * Remove the specified logbook.
     * Authorization handled by LogbookPolicy::delete.
     */
    public function destroy(Logbook $logbook): JsonResponse
    {
        $this->authorize('delete', $logbook);

        if ($logbook->status === 'approved') {
            return response()->json(['message' => 'Cannot delete an approved logbook.'], 403);
        }

        $this->logbookService->deleteLogbook($logbook);

        return response()->json(null, 204);
    }

    /**
     * Approve the specified logbook.
     * Authorization handled by LogbookPolicy::approve.
     */
    public function approve(Request $request, Logbook $logbook): JsonResponse
    {
        $this->authorize('approve', $logbook);

        $request->validate([
            'status' => 'required|in:approved,rejected',
            'feedback' => 'nullable|string|max:1000',
        ]);

        $updated = $this->logbookService->updateStatus($logbook, $request->status);
        $updated->load('internship.company', 'internship.leader');

        return new LogbookResource($updated);
    }
}
