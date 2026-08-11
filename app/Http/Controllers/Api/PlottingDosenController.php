<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\KpGroup;
use App\Models\KpGroupMember;
use App\Models\Lecturer;
use App\Http\Requests\AssignSupervisorRequest;
use Illuminate\Http\Request;

class PlottingDosenController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
        $this->middleware(function ($request, $next) {
            $response = $next($request);
            $response->headers->set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
            $response->headers->set('Pragma', 'no-cache');
            $response->headers->set('Expires', 'Sat, 01 Jan 1990 00:00:00 GMT');
            return $response;
        });
    }

    /**
     * Check if user is admin/coordinator with plotting permission.
     */
    private function canPlot()
    {
        return auth()->user()->can('kp.plotting-dosen');
    }

    /**
     * Check if user is a lecturer.
     */
    private function isLecturer()
    {
        return auth()->user()->hasRole('dosen');
    }

    /**
     * Daftar kelompok KP yang sudah disetujui dan belum memiliki dosen pembimbing.
     */
    public function unassignedGroups()
    {
        $groups = KpGroup::with([
            'academicPeriod',
            'kpTheme',
            'kpCompany',
            'members.student.user',
        ])
        ->where('status', 'disetujui')
        ->whereDoesntHave('members', function ($query) {
            $query->whereNotNull('supervisor_lecturer_id');
        })
        ->orderBy('created_at', 'desc')
        ->get();

        return response()->json($groups);
    }

    /**
     * Daftar dosen yang tersedia sebagai pembimbing.
     */
    public function availableLecturers()
    {
        // $lecturers = Lecturer::with('user')
        //     // ->where('is_active', true)
        //     ->orderBy('name')
        //    ->get();
        $lecturers = Lecturer::query()
            ->join('users', 'users.id', '=', 'lecturer.user_id')
            ->select(
                'lecturer.id',
                'users.name'
            )
            ->orderBy('users.name')
            ->get();

        return response()->json($lecturers);
    }

    /**
     * Plotting dosen pembimbing ke kelompok KP.
     */
    public function assignSupervisor(AssignSupervisorRequest $request)
    {
        $validated = $request->validated();

        $kpGroup = KpGroup::findOrFail($validated['kp_group_id']);

        // Assign supervisor ke SEMUA anggota kelompok
        foreach ($kpGroup->members as $member) {
            $member->update(['supervisor_lecturer_id' => $validated['lecturer_id']]);
        }

        $kpGroup->load('members.student.user', 'members.supervisor');

        return response()->json([
            'message' => 'Dosen pembimbing berhasil ditugaskan',
            'group' => $kpGroup,
        ]);
    }

    /**
     * Hapus plotting dosen pembimbing.
     */
    public function removeSupervisor(Request $request, int $kpGroupId)
    {
        $kpGroup = KpGroup::findOrFail($kpGroupId);

        // Hapus supervisor dari SEMUA anggota kelompok
        $kpGroup->members()->update(['supervisor_lecturer_id' => null]);

        return response()->json(['message' => 'Dosen pembimbing berhasil dihapus']);
    }

    /**
     * Kelompok yang sudah memiliki dosen pembimbing.
     */
    public function assignedGroups()
    {
        $groups = KpGroup::with([
            'academicPeriod',
            'kpTheme',
            'kpCompany',
            'members.student.user',
            'members.supervisor.user',
        ])
        ->where('status', 'disetujui')
        ->whereHas('members', function ($query) {
            $query->whereNotNull('supervisor_lecturer_id');
        })
        ->orderBy('created_at', 'desc')
        ->get();

        // Filter untuk menampilkan hanya satu entry per kelompok (berdasarkan supervisor pertama)
        $result = $groups->map(function ($group) {
            $supervisor = $group->members->first()?->supervisor;
            return [
                'id' => $group->id,
                'code' => $group->code,
                'status' => $group->status,
                'academic_period' => $group->academicPeriod,
                'kp_theme' => $group->kpTheme,
                'kp_company' => $group->kpCompany,
                'members_count' => $group->members->count(),
                'supervisor' => $supervisor ? [
                    'id' => $supervisor->id,
                    'name' => $supervisor->name,
                    'nidn' => $supervisor->nidn,
                ] : null,
                'assigned_at' => $group->members->first()?->updated_at,
            ];
        });

        return response()->json($result);
    }

    /**
     * Kelompok yang diplotting ke dosen yang login (untuk halaman dosen).
     */
    public function myGroups()
    {
        $user = auth()->user();
        
        $lecturer = $user->lecturer;
        if (!$lecturer) {
            return response()->json([]);
        }

        // Ambil semua kelompok dimana user ini adalah supervisor
        $groups = KpGroup::with([
            'academicPeriod',
            'kpTheme',
            'kpCompany',
            'members.student.user',
        ])
        ->whereHas('members', function ($query) use ($lecturer) {
            $query->where('supervisor_lecturer_id', $lecturer->id);
        })
        ->where('status', 'disetujui')
        ->orderBy('created_at', 'desc')
        ->get();

        // Format response dengan info supervisor
        $result = $groups->map(function ($group) {
            $member = $group->members->first();
            return [
                'id' => $group->id,
                'code' => $group->code,
                'name' => $group->name,
                'status' => $group->status,
                'academic_period' => $group->academicPeriod,
                'kp_theme' => $group->kpTheme,
                'kp_company' => $group->kpCompany,
                'members' => $group->members->map(function ($m) {
                    return [
                        'id' => $m->id,
                        'role' => $m->role,
                        'student' => $m->student ? [
                            'id' => $m->student->id,
                            'name' => $m->student->user?->name,
                            'nim' => $m->student->nim,
                        ] : null,
                    ];
                }),
                'members_count' => $group->members->count(),
                'assigned_at' => $member?->updated_at,
            ];
        });

        return response()->json($result);
    }
}