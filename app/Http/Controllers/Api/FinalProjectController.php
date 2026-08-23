<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreFinalProjectRequest;
use App\Http\Requests\VerifyFinalProjectRequest;
use App\Http\Resources\FinalProjectResource;
use App\Http\Resources\BimbinganResource;
use App\Models\FinalProject;
use App\Models\AcademicPeriod;
use App\Models\Bimbingan;
use App\Models\DosenPembimbing;
use Illuminate\Http\Request;

class FinalProjectController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
    }

    /**
     * Get pengajuan TA milik mahasiswa aktif (untuk Mahasiswa)
     * atau seluruh data pengajuan untuk Dosen/Admin
     */
    public function index(Request $request)
    {
        $user = $request->user();

        if ($user->hasRole('mahasiswa')) {
            $student = $user->student;
            if (!$student) {
                return response()->json(['data' => null]);
            }
            $finalProject = FinalProject::with(['mahasiswa.user', 'periode', 'dosenPembimbing.dosen.user'])
                ->where('mahasiswa_id', $student->id)
                ->first();

            return response()->json([
                'data' => $finalProject ? new FinalProjectResource($finalProject) : null
            ]);
        }

        // Koordinator / Admin: get antrean verifikasi
        $query = FinalProject::with(['mahasiswa.user', 'periode', 'dosenPembimbing.dosen.user']);
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        return FinalProjectResource::collection($query->get());
    }

    /**
     * Submit pengajuan judul TA baru oleh mahasiswa
     */
    public function store(StoreFinalProjectRequest $request)
    {
        if (!$request->user()->can('ta.pengajuan')) {
            abort(403, 'Anda tidak memiliki izin untuk mengajukan Tugas Akhir.');
        }

        $user = $request->user();
        $student = $user->student;

        if (!$student) {
            abort(422, 'Data mahasiswa tidak ditemukan.');
        }

        // Pastikan ada periode akademik aktif
        $activePeriod = AcademicPeriod::where('is_active', true)->first();
        if (!$activePeriod) {
            abort(422, 'Tidak ada periode akademik aktif. Pengajuan Tugas Akhir ditutup.');
        }

        // Cek jika mahasiswa sudah memiliki pengajuan TA
        $existing = FinalProject::where('mahasiswa_id', $student->id)->first();
        if ($existing) {
            if ($existing->status === 'revisi_judul') {
                $existing->update([
                    'title'       => $request->title,
                    'description' => $request->description,
                    'status'      => 'pengajuan',
                    'catatan_penolakan' => null,
                ]);
                return response()->json(new FinalProjectResource($existing->load(['mahasiswa.user', 'periode', 'dosenPembimbing.dosen.user'])), 200);
            }
            abort(422, 'Anda sudah pernah mengajukan Tugas Akhir.');
        }

        $finalProject = FinalProject::create([
            'title'       => $request->title,
            'description' => $request->description,
            'mahasiswa_id' => $student->id,
            'periode_id'  => $activePeriod->id,
            'tanggal_pengajuan' => now()->toDateString(),
            'status'      => 'pengajuan',
        ]);

        return response()->json(new FinalProjectResource($finalProject->load(['mahasiswa.user', 'periode', 'dosenPembimbing.dosen.user'])), 201);
    }

    /**
     * Verifikasi judul TA oleh koordinator (terima / tolak)
     */
    public function verify(VerifyFinalProjectRequest $request, $id)
    {
        if (!$request->user()->can('ta.verifikasi-judul')) {
            abort(403, 'Anda tidak memiliki izin untuk memverifikasi Tugas Akhir.');
        }

        $finalProject = FinalProject::findOrFail($id);

        if ($finalProject->status !== 'pengajuan') {
            abort(422, 'Tugas Akhir ini tidak dalam status pengajuan verifikasi.');
        }

        $status = $request->status; // approved / rejected
        $catatanPenolakan = $request->catatan_penolakan;

        if ($status === 'approved') {
            $finalProject->update([
                'status' => 'bimbingan', // disetujui, lanjut ke tahap bimbingan
                'judul_disetujui' => $request->judul_disetujui ?? $finalProject->title,
            ]);
        } else {
            $finalProject->update([
                'status' => 'revisi_judul',
                'catatan_penolakan' => $catatanPenolakan,
            ]);
        }

        return response()->json(new FinalProjectResource($finalProject->load(['mahasiswa.user', 'periode', 'dosenPembimbing.dosen.user'])));
    }

    /**
     * Plotting Dosen Pembimbing TA oleh Koordinator
     */
    public function assignSupervisor(Request $request, $id)
    {
        if (!$request->user()->can('ta.plotting-dosen')) {
            abort(403, 'Anda tidak memiliki izin untuk memplotting dosen pembimbing TA.');
        }

        $request->validate([
            'lecturer_id' => ['required', 'exists:lecturer,id'],
        ]);

        $finalProject = FinalProject::findOrFail($id);

        DosenPembimbing::create([
            'pembimbingable_id' => $finalProject->id,
            'pembimbingable_type' => FinalProject::class,
            'dosen_id' => $request->lecturer_id,
            'peran' => 'pembimbing_1',
            'status_acc_ujian' => true,
            'status_acc_revisi' => false,
        ]);

        return response()->json(new FinalProjectResource($finalProject->load(['mahasiswa.user', 'periode', 'dosenPembimbing.dosen.user'])));
    }

    /**
     * Get bimbingan notes for a TA project
     */
    public function getBimbingan(Request $request, $finalProjectId)
    {
        $finalProject = FinalProject::findOrFail($finalProjectId);
        $user = $request->user();

        // Mahasiswa can only view their own bimbingan
        if ($user->hasRole('mahasiswa')) {
            $student = $user->student;
            if (!$student || $finalProject->mahasiswa_id !== $student->id) {
                abort(403, 'Anda tidak memiliki izin untuk melihat bimbingan ini.');
            }
        }

        $bimbingan = Bimbingan::where('bimbingable_id', $finalProjectId)
            ->where('bimbingable_type', FinalProject::class)
            ->with(['mahasiswa.user', 'dosen.user'])
            ->orderByDesc('tanggal')
            ->orderByDesc('created_at')
            ->get();

        return response()->json($bimbingan);
    }

    /**
     * Add bimbingan note for a TA project
     */
    public function addBimbingan(Request $request, $finalProjectId)
    {
        $finalProject = FinalProject::findOrFail($finalProjectId);
        $user = $request->user();

        $request->validate([
            'aktivitas' => ['required', 'string'],
            'file' => ['nullable', 'file', 'max:5120'],
            'status' => ['nullable', 'string', 'in:pending,diterima,revisi'],
            'catatan_dosen' => ['nullable', 'string'],
            'tanggal' => ['nullable', 'date'],
        ]);

        // Mahasiswa can only add notes to their own TA
        if ($user->hasRole('mahasiswa')) {
            $student = $user->student;
            if (!$student || $finalProject->mahasiswa_id !== $student->id) {
                abort(403, 'Anda tidak memiliki izin untuk menambahkan catatan bimbingan ini.');
            }
        }

        $data = [
            'bimbingable_id'   => $finalProjectId,
            'bimbingable_type' => FinalProject::class,
            'mahasiswa_id'    => $finalProject->mahasiswa_id,
            'dosen_id'   => $user->hasRole('dosen') ? $user->lecturer?->id : $finalProject->dosenPembimbing->first()?->dosen_id,
            'aktivitas'         => $request->aktivitas,
            'catatan_dosen' => $request->catatan_dosen,
            'status' => $request->status ?? 'pending',
            'tanggal' => $request->tanggal ?? now()->toDateString(),
        ];

        if ($request->hasFile('file')) {
            $data['file'] = $request->file('file')->store('bimbingan', 'public');
        }

        $bimbingan = Bimbingan::create($data);

        return response()->json($bimbingan->load(['mahasiswa.user', 'dosen.user']), 201);
    }

    /**
     * Update bimbingan note
     */
    public function updateBimbingan(Request $request, $finalProjectId, $bimbinganId)
    {
        $finalProject = FinalProject::findOrFail($finalProjectId);
        $bimbingan = Bimbingan::where('id', $bimbinganId)
            ->where('bimbingable_id', $finalProjectId)
            ->where('bimbingable_type', FinalProject::class)
            ->firstOrFail();

        $user = $request->user();

        // Only the lecturer who created it or the student can update
        if ($user->hasRole('mahasiswa')) {
            $student = $user->student;
            if (!$student || $bimbingan->mahasiswa_id !== $student->id) {
                abort(403, 'Anda tidak memiliki izin untuk mengedit catatan ini.');
            }
        }

        $request->validate([
            'aktivitas' => ['required', 'string'],
            'file' => ['nullable', 'file', 'max:5120'],
            'status' => ['nullable', 'string', 'in:pending,diterima,revisi'],
            'catatan_dosen' => ['nullable', 'string'],
            'tanggal' => ['nullable', 'date'],
        ]);

        $data = [
            'aktivitas' => $request->aktivitas,
            'catatan_dosen' => $request->catatan_dosen,
            'status' => $request->status ?? $bimbingan->status,
            'tanggal' => $request->tanggal ?? $bimbingan->tanggal,
        ];

        if ($request->hasFile('file')) {
            $data['file'] = $request->file('file')->store('bimbingan', 'public');
        }

        $bimbingan->update($data);

        return response()->json($bimbingan->load(['mahasiswa.user', 'dosen.user']));
    }

    /**
     * Delete bimbingan note
     */
    public function deleteBimbingan(Request $request, $finalProjectId, $bimbinganId)
    {
        $finalProject = FinalProject::findOrFail($finalProjectId);
        $bimbingan = Bimbingan::where('id', $bimbinganId)
            ->where('bimbingable_id', $finalProjectId)
            ->where('bimbingable_type', FinalProject::class)
            ->firstOrFail();

        $user = $request->user();

        // Only the lecturer who created it or koordinator can delete
        if ($user->hasRole('mahasiswa')) {
            abort(403, 'Mahasiswa tidak dapat menghapus catatan bimbingan.');
        }

        if ($user->hasRole('dosen') && $bimbingan->dosen_id !== $user->lecturer?->id) {
            abort(403, 'Anda tidak memiliki izin untuk menghapus catatan ini.');
        }

        $bimbingan->delete();

        return response()->json(['message' => 'Catatan bimbingan berhasil dihapus']);
    }
}
