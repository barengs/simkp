<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Internship;
use App\Models\InternshipMember;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class InternshipController extends Controller
{
    public function __construct()
    {


    }

    /**
     * Display a listing of the internships.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        
        $query = Internship::with(['leader', 'supervisor', 'company', 'theme', 'period']);

        if ($user->hasRole('admin')) {
            // Admin: semua data
        } elseif ($user->hasRole('koordinator_ta')) {
            // Koordinator TA: semua data
        } elseif ($user->hasPermissionTo('student logbook')) {
            // Mahasiswa: hanya kelompoknya sendiri
            $student = Student::where('user_id', $user->id)->first();
            if ($student) {
                $query->where(function ($q) use ($student) {
                    $q->where('leader_id', $student->id)
                      ->orWhereHas('members', function ($q2) use ($student) {
                          $q2->where('student_id', $student->id);
                      });
                });
            }
        } elseif ($user->hasRole('dosen_pembimbing') || $user->hasRole('dosen_penguji')) {
            // Dosen: hanya yang dia bimbing/penguji
            $lecturer = $user->lecturer;
            if ($lecturer) {
                $query->where('supervisor_id', $lecturer->id);
            }
        }

        return response()->json([
            'success' => true,
            'data' => $query->paginate(15),
        ]);
    }

    /**
     * List internship groups (for monitoring pages).
     */
    public function listGroups(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = Internship::with(['leader', 'supervisor', 'company', 'theme', 'period']);

        if (!$user->hasRole('admin') && !$user->hasRole('koordinator_ta')) {
            if ($user->hasPermissionTo('student logbook')) {
                $student = Student::where('user_id', $user->id)->first();
                if ($student) {
                    $query->where(function ($q) use ($student) {
                        $q->where('leader_id', $student->id)
                          ->orWhereHas('members', function ($q2) use ($student) {
                              $q2->where('student_id', $student->id);
                          });
                    });
                }
            } elseif ($user->hasRole('dosen_pembimbing') || $user->hasRole('dosen_penguji')) {
                $lecturer = $user->lecturer;
                if ($lecturer) {
                    $query->where('supervisor_id', $lecturer->id);
                }
            }
        }

        return response()->json([
            'success' => true,
            'data' => $query->get(),
        ]);
    }

    /**
     * Store a newly created internship.
     */
    public function store(Request $request): JsonResponse
    {
        $this->authorize('create', Internship::class);

        $validator = Validator::make($request->all(), [
            'leader_id' => 'required|exists:students,id',
            'supervisor_id' => 'required|exists:lecturers,id',
            'theme_id' => 'required|exists:themes,id',
            'company_id' => 'required|exists:companies,id',
            'period_id' => 'required|exists:periods,id',
            'started_at' => 'required|date',
            'ended_at' => 'required|date|after:started_at',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $internship = Internship::create($validator->validated());

        return response()->json([
            'success' => true,
            'message' => 'Kelompok KP berhasil dibuat.',
            'data' => $internship,
        ], 201);
    }

    /**
     * Display the specified internship.
     */
    public function show(Internship $internship, Request $request): JsonResponse
    {
        $user = $request->user();
        $this->authorize('view', $internship);

        return response()->json([
            'success' => true,
            'data' => $internship->load([
                'leader', 'supervisor', 'company', 'theme', 'period',
                'members.student.user',
                'logbooks', 'reports', 'evaluations'
            ]),
        ]);
    }

    /**
     * Update the specified internship.
     */
    public function update(Request $request, Internship $internship): JsonResponse
    {
        $this->authorize('update', $internship);

        $validator = Validator::make($request->all(), [
            'supervisor_id' => 'sometimes|exists:lecturers,id',
            'status' => 'sometimes|in:ongoing,finished,grading,submitted,approved,rejected',
            'started_at' => 'sometimes|date',
            'ended_at' => 'sometimes|date|after:started_at',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $internship->update($validator->validated());

        return response()->json([
            'success' => true,
            'message' => 'Kelompok KP berhasil diperbarui.',
            'data' => $internship,
        ]);
    }

    /**
     * Remove the specified internship.
     */
    public function destroy(Internship $internship): JsonResponse
    {
        $this->authorize('delete', $internship);

        $internship->delete();

        return response()->json([
            'success' => true,
            'message' => 'Kelompok KP berhasil dihapus.',
        ]);
    }

    /**
     * Assign supervisor to internship.
     */
    public function assignSupervisor(Request $request, Internship $internship): JsonResponse
    {
        $this->authorize('assignSupervisor', Internship::class);

        $validator = Validator::make($request->all(), [
            'supervisor_id' => 'required|exists:lecturers,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $internship->update(['supervisor_id' => $validator->validated()['supervisor_id']]);

        return response()->json([
            'success' => true,
            'message' => 'Pembimbing berhasil ditugaskan.',
            'data' => $internship,
        ]);
    }
}