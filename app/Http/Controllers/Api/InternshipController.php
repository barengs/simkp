<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\InternshipRequest;
use App\Http\Resources\InternshipResource;
use App\Services\InternshipService;
use Illuminate\Support\Facades\Auth;

use Illuminate\Support\Facades\Log;

class InternshipController extends Controller
{
    protected $internshipService;

    public function __construct(InternshipService $internshipService)
    {
        $this->internshipService = $internshipService;
    }

    public function index()
    {
        $user = Auth::user();
        $student = \App\Models\Student::where('user_id', $user->id)->first();
        Log::info("InternshipController index hit by user ID: " . $user->id);

        if (!$student) {
            Log::warning("User ID " . $user->id . " has no student record in DB.");
            return response()->json(['message' => 'Akun tidak terhubung dengan data mahasiswa.'], 403);
        }
        $studentId = $student->id;

        $internship = $this->internshipService->getStudentInternship($studentId);

        if (!$internship) {
            return response()->json(['message' => 'No internship found'], 404);
        }

        return new InternshipResource($internship);
    }

    public function store(InternshipRequest $request)
    {
        try {
            $user = Auth::user();
            $student = \App\Models\Student::where('user_id', $user->id)->first();
            if (!$student) {
                return response()->json(['message' => 'Akun tidak terhubung dengan data mahasiswa.'], 403);
            }
            $studentId = $student->id;

            // Re-check if student already has an internship
            $existing = $this->internshipService->getStudentInternship($studentId);
            if ($existing) {
                return response()->json(['message' => 'Anda sudah terdaftar di KP lain.'], 422);
            }

            $internship = $this->internshipService->register($request->validated(), $studentId);

            return (new InternshipResource($internship->load(['leader', 'period', 'company', 'theme', 'supervisor', 'students'])))
                ->additional(['message' => 'Pendaftaran KP berhasil dikirim!']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Terjadi kesalahan: ' . $e->getMessage()], 500);
        }
    }
}