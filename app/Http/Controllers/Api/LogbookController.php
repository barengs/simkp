<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Logbook;
use App\Services\LogbookService;
use App\Http\Requests\LogbookRequest;
use App\Http\Requests\UpdateLogbookStatusRequest;
use App\Http\Resources\LogbookResource;
use Illuminate\Http\Request;

class LogbookController extends Controller
{
    protected $logbookService;

    public function __construct(LogbookService $logbookService)
    {
        $this->logbookService = $logbookService;
    }

    public function index(Request $request)
    {
        $user = $request->user();
        
        // Return based on role
        if ($user->role === 'mahasiswa') {
            $logbooks = $this->logbookService->getLogbooksByStudent($user->student->id ?? 0);
        } elseif ($user->role === 'dosen') {
            $logbooks = $this->logbookService->getLogbooksBySupervisor($user->lecturer->id ?? 0);
        } else {
            $logbooks = $this->logbookService->getAllLogbooks();
        }

        return LogbookResource::collection($logbooks);
    }

    public function store(LogbookRequest $request)
    {
        $logbook = $this->logbookService->createLogbook($request->validated());
        $logbook->load('internship.company', 'internship.leader');
        return new LogbookResource($logbook);
    }

    public function show(Logbook $logbook)
    {
        $logbook->load('internship.company', 'internship.leader');
        return new LogbookResource($logbook);
    }

    public function update(LogbookRequest $request, Logbook $logbook)
    {
        if ($logbook->status === 'approved') {
            return response()->json(['message' => 'Cannot modify an approved logbook.'], 403);
        }
        
        $updated = $this->logbookService->updateLogbook($logbook, $request->validated());
        $updated->load('internship.company', 'internship.leader');
        return new LogbookResource($updated);
    }

    public function destroy(Logbook $logbook)
    {
        if ($logbook->status === 'approved') {
            return response()->json(['message' => 'Cannot delete an approved logbook.'], 403);
        }
        
        $this->logbookService->deleteLogbook($logbook);
        return response()->json(null, 204);
    }

    public function approve(UpdateLogbookStatusRequest $request, Logbook $logbook)
    {
        $user = $request->user();
        if ($user->role !== 'dosen' && $user->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $updated = $this->logbookService->updateStatus($logbook, $request->status);
        $updated->load('internship.company', 'internship.leader');
        return new LogbookResource($updated);
    }
}
