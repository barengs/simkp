<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateVerifikasiRequest;
use App\Http\Resources\RegistrationVerificationResource;
use App\Services\RegistrationVerificationService;
use App\Models\KpDocument;
use Illuminate\Http\Request;

class RegistrationVerificationController extends Controller
{
    public function __construct(
        private readonly RegistrationVerificationService $verificationService
    ) {
        $this->middleware('auth:sanctum');
        $this->middleware('permission:kp.verifikasi-pendaftaran');
    }

    public function index(Request $request)
    {
        try {
            $verifications = $this->verificationService->getPaginated($request->all());
            return RegistrationVerificationResource::collection($verifications);
        } catch (\Throwable $e) {
            return response()->json(['message' => 'Gagal memuat data verifikasi pendaftaran.'], 500);
        }
    }

    public function show(int $id)
    {
        try {
            $verification = $this->verificationService->getById($id);
            return response()->json(new RegistrationVerificationResource($verification));
        } catch (\Throwable $e) {
            return response()->json(['message' => 'Data pendaftaran tidak ditemukan.'], 404);
        }
    }

    public function update(UpdateVerifikasiRequest $request, int $id)
    {
        try {
            // If request contains a specific document note update
            if ($request->has('document_id') && $request->has('document_revision_note')) {
                $docId = $request->input('document_id');
                $note = $request->input('document_revision_note');
                $document = KpDocument::where('kp_group_id', $id)
                    ->where('id', $docId)
                    ->first();
                if ($document) {
                    $document->notes = $note;
                    $document->save();
                    return response()->json([
                        'message' => 'Catatan revisi dokumen berhasil disimpan.',
                        'data' => new RegistrationVerificationResource($this->verificationService->getById($id))
                    ]);
                }
                return response()->json(['message' => 'Dokumen tidak ditemukan.'], 404);
            }
            $updated = $this->verificationService->update($id, $request->validated());
            return response()->json(new RegistrationVerificationResource($updated));
        } catch (\Throwable $e) {
            return response()->json(['message' => 'Gagal memperbarui verifikasi pendaftaran.'], 500);
        }
    }

    public function removeMember(int $id, int $memberId)
    {
        try {
            $updated = $this->verificationService->removeMember($id, $memberId);
            return response()->json([
                'message' => 'Anggota berhasil dikeluarkan dari kelompok.',
                'data' => new RegistrationVerificationResource($updated),
            ]);
        } catch (\InvalidArgumentException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['message' => 'Anggota atau kelompok tidak ditemukan.'], 404);
        } catch (\Throwable $e) {
            return response()->json(['message' => 'Gagal mengeluarkan anggota dari kelompok.'], 500);
        }
    }

    public function addMember(int $id, Request $request)
    {
        $request->validate([
            'student_id' => ['required', 'integer', 'exists:student,id'],
        ]);

        try {
            $updated = $this->verificationService->addMember($id, $request->integer('student_id'));
            return response()->json([
                'message' => 'Anggota berhasil ditambahkan ke kelompok.',
                'data' => new RegistrationVerificationResource($updated),
            ]);
        } catch (\InvalidArgumentException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['message' => 'Kelompok atau mahasiswa tidak ditemukan.'], 404);
        } catch (\Throwable $e) {
            return response()->json(['message' => 'Gagal menambahkan anggota ke kelompok.'], 500);
        }
    }
}
