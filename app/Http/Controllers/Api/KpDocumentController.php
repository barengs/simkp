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
     * Jika dokumen sama (jenisnya) sudah ada dengan status 'revision', update dokumen tersebut dan ubah status ke 'submitted'.
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

        // Cek apakah sudah ada dokumen dengan tipe yang sama dan status 'revision'
        // Jika ada, update dokumen tersebut (re-submission revisi)
        $existingDocument = KpDocument::where('kp_group_id', $request->kp_group_id)
            ->where('document_type_id', $request->document_type_id)
            ->where('status', 'revision')
            ->first();

        $isResubmission = false;
        $oldStatus = null;

        if ($existingDocument) {
            // Re-submission: update dokumen yang sudah ada
            $isResubmission = true;
            $oldStatus = $existingDocument->status;

            // Hapus file lama
            if ($existingDocument->file_url) {
                $fullPath = str_replace('/storage', 'app/public', $existingDocument->file_url);
                Storage::delete($fullPath);
            }

            // Simpan file baru
            $file = $request->file('file');
            $filename = uniqid() . '.' . $file->getClientOriginalExtension();
            $path = $file->storeAs('kp-documents', $filename, 'public');

            $existingDocument->update([
                'title' => $request->title,
                'file_url' => Storage::url($path),
                'submitted_at' => now(),
                'status' => 'submitted',
                'notes' => null, // Clear notes saat re-submission
            ]);

            $document = $existingDocument;
            $message = 'Dokumen revisi berhasil disubmit ulang';
        } else {
            // Upload baru
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

            $message = 'Dokumen berhasil diupload';
        }

        return response()->json([
            'message' => $message,
            'document' => $document,
            'is_resubmission' => $isResubmission,
        ], $isResubmission ? 200 : 201);
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

    /**
     * Setujui dokumen KP.
     */
    public function approve(Request $request, int $id)
    {
        $document = KpDocument::findOrFail($id);
        $kpGroup = $document->kpGroup;
        $user = $request->user();

        $isSupervisor = $user->hasRole('dosen') &&
            $kpGroup->members()
                ->where('supervisor_lecturer_id', $user->lecturer?->id)
                ->exists();

        if (!$isSupervisor && !$user->can('master-data.manage')) {
            abort(403, 'Anda tidak memiliki izin untuk menyetujui dokumen ini.');
        }

        $document->update([
            'status' => 'approved',
            'notes' => $request->input('notes'),
        ]);

        return response()->json([
            'message' => 'Dokumen berhasil disetujui',
            'document' => $document,
            'group' => $kpGroup->load(['members.student', 'kpDocuments.documentType', 'kpDocuments.student']),
        ]);
    }

    /**
     * Tolak dokumen KP.
     */
    public function reject(Request $request, int $id)
    {
        $document = KpDocument::findOrFail($id);
        $kpGroup = $document->kpGroup;
        $user = $request->user();

        $isSupervisor = $user->hasRole('dosen') &&
            $kpGroup->members()
                ->where('supervisor_lecturer_id', $user->lecturer?->id)
                ->exists();

        if (!$isSupervisor && !$user->can('master-data.manage')) {
            abort(403, 'Anda tidak memiliki izin untuk menolak dokumen ini.');
        }

        $document->update([
            'status' => 'revision',
            'notes' => $request->input('notes'),
        ]);

        return response()->json([
            'message' => 'Dokumen ditolak',
            'document' => $document,
            'group' => $kpGroup->load(['members.student', 'kpDocuments.documentType', 'kpDocuments.student']),
        ]);
    }

    /**
     * Minta revisi dokumen KP.
     */
    public function revise(Request $request, int $id)
    {
        $document = KpDocument::findOrFail($id);
        $kpGroup = $document->kpGroup;
        $user = $request->user();

        $isSupervisor = $user->hasRole('dosen') &&
            $kpGroup->members()
                ->where('supervisor_lecturer_id', $user->lecturer?->id)
                ->exists();

        if (!$isSupervisor && !$user->can('master-data.manage')) {
            abort(403, 'Anda tidak memiliki izin untuk meminta revisi dokumen ini.');
        }

        $document->update([
            'status' => 'revision',
            'notes' => $request->input('notes'),
        ]);

        return response()->json([
            'message' => 'Permintaan revisi dikirim',
            'document' => $document,
            'group' => $kpGroup->load(['members.student', 'kpDocuments.documentType', 'kpDocuments.student']),
        ]);
    }
}