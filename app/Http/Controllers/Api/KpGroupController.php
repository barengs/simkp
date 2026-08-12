<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreKpGroupRequest;
use App\Http\Requests\UpdateKpGroupRequest;
use App\Http\Resources\KpGroupResource;
use App\Services\KpGroupService;
use Illuminate\Http\Request;

class KpGroupController extends Controller
{
    public function __construct(
        private readonly KpGroupService $kpGroupService
    ) {
        $this->middleware('auth:sanctum');
    }

    /**
     * Mahasiswa: hanya kelompok milik sendiri.
     * Role lain (koordinator, dosen, admin): semua kelompok.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        // Mahasiswa: tampilkan kelompok di mana dia menjadi anggota (ketua maupun anggota biasa)
        // Ini mencakup kelompok yang dia buat sendiri maupun yang dia diundang
        if ($user->hasRole('mahasiswa')) {
            $student = $user->student;
            if (!$student) {
                return response()->json([]);
            }
            return KpGroupResource::collection(
                $this->kpGroupService->getByStudent($student->id)
            );
        }

        // Koordinator / Dosen / Admin: semua kelompok
        return KpGroupResource::collection($this->kpGroupService->getAll());
    }

    /**
     * Hanya mahasiswa dengan permission kp.kelompok.create yang boleh membuat kelompok.
     */
    public function store(StoreKpGroupRequest $request)
    {
        if (!$request->user()->can('kp.kelompok.create')) {
            abort(403, 'Anda tidak memiliki izin untuk mendaftar kelompok KP.');
        }

        $user    = $request->user();
        $student = $user->student;

        if (!$student) {
            abort(422, 'Data mahasiswa tidak ditemukan untuk akun ini.');
        }

        $data                    = $request->validated();
        $data['ketua_student_id'] = $student->id;

        $kelompok = $this->kpGroupService->create($data);
        return response()->json(new KpGroupResource($kelompok), 201);
    }

    public function show(int $id)
    {
        $kelompok = $this->kpGroupService->getById($id);
        return response()->json(new KpGroupResource($kelompok));
    }

    public function update(UpdateKpGroupRequest $request, int $id)
    {
        $kelompok = $this->kpGroupService->getById($id);

        // Hanya ketua kelompok atau admin/koordinator yang boleh edit
        $user    = $request->user();
        $student = $user->student;
        $isKetua = $student && $kelompok->members
            ->where('student_id', $student->id)
            ->where('role', 'ketua')
            ->isNotEmpty();

        if (!$isKetua && !$user->can('kp.verifikasi-pendaftaran')) {
            abort(403, 'Hanya ketua kelompok yang dapat mengubah data pendaftaran.');
        }

        if ($kelompok->status !== 'draft') {
            abort(422, 'Pendaftaran yang sudah diajukan tidak dapat diubah.');
        }

        $updated = $this->kpGroupService->update($id, $request->validated());
        return response()->json(new KpGroupResource($updated));
    }

    public function destroy(int $id)
    {
        $kelompok = $this->kpGroupService->getById($id);

        $user    = request()->user();
        $student = $user->student;
        $isKetua = $student && $kelompok->members
            ->where('student_id', $student->id)
            ->where('role', 'ketua')
            ->isNotEmpty();

        if (!$isKetua && !$user->can('master-data.manage')) {
            abort(403, 'Hanya ketua kelompok yang dapat menghapus pendaftaran.');
        }

        $this->kpGroupService->delete($id);
        return response()->json(['message' => 'Deleted']);
    }

    public function acceptInvitation(int $id)
    {
        $user = request()->user();
        $student = $user->student;

        if (!$student) {
            abort(403, 'Data mahasiswa tidak ditemukan.');
        }

        $member = $this->kpGroupService->acceptInvitation($id, $student->id);

        return response()->json(new KpGroupResource($member->kpGroup));
    }

    public function declineInvitation(int $id)
    {
        $user = request()->user();
        $student = $user->student;

        if (!$student) {
            abort(403, 'Data mahasiswa tidak ditemukan.');
        }

        $this->kpGroupService->declineInvitation($id, $student->id);

        return response()->json(['message' => 'Invitation declined']);
    }
}
