<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\KpDocument;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class KpDocumentController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
    }

    /**
     * Upload dokumen untuk kelompok KP.
     * Mahasiswa yang menjadi anggota kelompok atau dosen pembimbing dapat mengupload.
     */
    public function store(Request $request)
    {
        $request->validate([
            'kp_group_id' => 'required|exists:kp_group,id',
            'document_type_id' => 'required|exists:document_type,id',
            'title' => 'required|string|max:255',
            'file' => 'required|file|max:10240|mimes:pdf,doc,docx',
        ]);

        $kpGroup = \App\Models\KpGroup::findOrFail($request->kp_group_id);
        $user = $request->user();

        // Cek apakah user有权 upload (anggota kelompok atau dosen pembimbing)
        $student = $user->student;
        $isMember = false;
        if ($student) {
            $isMember = $kpGroup->members()
                ->where('student_id', $student->id)
                ->exists();
        }

        // Pembuat kelompok juga bisa upload (untuk handle race condition saat pendaftaran baru)
        $isCreator = $kpGroup->members()
            ->where('role', 'ketua')
            ->where('student_id', $student?->id)
            ->exists();

        // Dosen pembimbing juga bisa upload
        $isSupervisor = $user->hasRole('dosen') && 
            $kpGroup->members()
                ->where('supervisor_lecturer_id', $user->lecturer?->id)
                ->exists();

        if (!$isMember && !$isCreator && !$isSupervisor && !$user->can('master-data.manage')) {
            abort(403, 'Anda tidak memiliki izin untuk mengupload dokumen.');
        }

        // Simpan file
        $file = $request->file('file');
        $filename = uniqid() . '.' . $file->getClientOriginalExtension();
        $path = $file->storeAs('kp-documents', $filename, 'public');

        $document = KpDocument::create([
            'kp_group_id' => $request->kp_group_id,
            'document_type_id' => $request->document_type_id,
            'student_id' => $student?->id,
            'title' => $request->title,
            'file_url' => Storage::url($path),
            'submitted_at' => now(),
            'status' => 'submitted',
        ]);

        return response()->json([
            'message' => 'Dokumen berhasil diupload',
            'document' => $document,
        ], 201);
    }

    /**
     * Hapus dokumen.
     */
    public function destroy(Request $request, int $id)
    {
        $document = KpDocument::findOrFail($id);
        $kpGroup = $document->kpGroup;
        $user = $request->user();

        // Cek apakah user有权 delete (pengupload, dosen pembimbing, atau admin)
        $student = $user->student;
        $isOwner = $student && $document->student_id === $student->id;
        $isSupervisor = $user->hasRole('dosen') && 
            $kpGroup->members()
                ->where('supervisor_lecturer_id', $user->lecturer?->id)
                ->exists();

        if (!$isOwner && !$isSupervisor && !$user->can('master-data.manage')) {
            abort(403, 'Anda tidak memiliki izin untuk menghapus dokumen ini.');
        }

        // Hapus file
        if ($document->file_url) {
            $fullPath = str_replace('/storage', 'app/public', $document->file_url);
            Storage::delete($fullPath);
        }

        $document->delete();

        return response()->json(['message' => 'Dokumen berhasil dihapus']);
    }
}