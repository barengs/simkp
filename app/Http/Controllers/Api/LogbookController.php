<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Logbook;
use App\Services\LogbookService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

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

        if ($user->role === 'mahasiswa') {
            $logbooks = $this->logbookService->getStudentLogbooks($user->student);
            return response()->json($logbooks);
        } else if ($user->role === 'dosen') {
            // Check if lecturer
            if (!$user->lecturer) {
                return response()->json(['message' => 'Unauthorized: Data Dosen tidak ditemukan'], 403);
            }
            $logbooks = $this->logbookService->getLogbooksForLecturer($user->lecturer);
            return response()->json($logbooks);
        }

        return response()->json(['message' => 'Unauthorized'], 403);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'date' => 'required|date',
            'activity' => 'required|string|min:10',
            'evidence' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:2048'
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Validasi gagal', 'errors' => $validator->errors()], 422);
        }

        try {
            $logbook = $this->logbookService->createLogbook(
                $request->user()->student,
                $request->all(),
                $request->file('evidence')
            );
            return response()->json(['message' => 'Logbook berhasil disimpan', 'data' => $logbook], 201);
        } catch (ValidationException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Terjadi kesalahan: ' . $e->getMessage()], 500);
        }
    }

    public function validateLogbook(Request $request, Logbook $logbook)
    {
        $request->validate([
            'status' => 'required|in:approved,rejected',
            'reason' => 'nullable|required_if:status,rejected|string'
        ]);

        // Authorization check: Ensure lecturer is the supervisor of this internship
        $user = $request->user();
        if (!$user->lecturer || $user->lecturer->id !== $logbook->internship->supervisor_id) {
            return response()->json(['message' => 'Unauthorized action'], 403);
        }

        $logbook = $this->logbookService->validateLogbook($logbook, $request->status, $request->reason);

        return response()->json(['message' => 'Status logbook diperbarui', 'data' => $logbook]);
    }
}
