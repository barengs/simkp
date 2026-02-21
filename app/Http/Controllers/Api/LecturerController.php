<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Lecturer;
use App\Services\LecturerService;
use App\Http\Requests\LecturerRequest;
use App\Http\Resources\LecturerResource;

class LecturerController extends Controller
{
    protected $lecturerService;

    public function __construct(LecturerService $lecturerService)
    {
        $this->lecturerService = $lecturerService;
    }

    public function index()
    {
        $lecturers = $this->lecturerService->getAllLecturers();
        return LecturerResource::collection($lecturers);
    }

    public function store(LecturerRequest $request)
    {
        $lecturer = $this->lecturerService->createLecturer($request->validated());
        return new LecturerResource($lecturer);
    }

    public function show(Lecturer $lecturer)
    {
        return new LecturerResource($lecturer);
    }

    public function update(LecturerRequest $request, Lecturer $lecturer)
    {
        $updatedLecturer = $this->lecturerService->updateLecturer($lecturer, $request->validated());
        return new LecturerResource($updatedLecturer);
    }

    public function destroy(Lecturer $lecturer)
    {
        $this->lecturerService->deleteLecturer($lecturer);
        return response()->json(null, 204);
    }

    public function resetPassword(Lecturer $lecturer)
    {
        $this->lecturerService->resetPassword($lecturer);
        return response()->json(['message' => 'Password berhasil direset menjadi default (dosen123).']);
    }
}
