<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DocumentType;
use App\Http\Requests\StoreDocumentTypeRequest;
use App\Http\Requests\UpdateDocumentTypeRequest;
use App\Http\Resources\DocumentTypeResource;
use Illuminate\Http\Request;

class DocumentTypeController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
        // index & show boleh diakses semua role terautentikasi (mahasiswa, dosen, dst.)
        // karena data ini dibutuhkan sebagai referensi saat mengisi form stepper dokumen.
        // Hanya CUD yang memerlukan permission master-data.manage (Admin).
        $this->middleware('permission:master-data.manage')->only(['store', 'update', 'destroy']);
    }

    /**
     * Daftar semua tipe dokumen (untuk dropdown/list di stepper)
     */
    public function index()
    {
        return DocumentTypeResource::collection(
            DocumentType::orderBy('name')->get()
        );
    }

    /**
     * Buat tipe dokumen baru (admin-only)
     */
    public function store(StoreDocumentTypeRequest $request)
    {
        try {
            $documentType = DocumentType::create($request->validated());
            return response()->json(new DocumentTypeResource($documentType), 201);
        } catch (\Throwable $e) {
            return response()->json(['message' => 'Gagal menyimpan data tipe dokumen.'], 500);
        }
    }

    public function show(DocumentType $documentType)
    {
        try {
            return response()->json(new DocumentTypeResource($documentType));
        } catch (\Throwable $e) {
            return response()->json(['message' => 'Data tipe dokumen tidak ditemukan.'], 404);
        }
    }

    public function update(UpdateDocumentTypeRequest $request, DocumentType $documentType)
    {
        try {
            $documentType->update($request->validated());
            return response()->json(new DocumentTypeResource($documentType));
        } catch (\Throwable $e) {
            return response()->json(['message' => 'Gagal memperbarui data tipe dokumen.'], 500);
        }
    }

    public function destroy(DocumentType $documentType)
    {
        try {
            if ($documentType->documents()->exists()) {
                return response()->json(['message' => 'Tipe dokumen ini sudah digunakan oleh dokumen lain. Tidak dapat dihapus.'], 422);
            }

            $documentType->delete();
            return response()->json(['message' => 'Tipe dokumen berhasil dihapus']);
        } catch (\Throwable $e) {
            return response()->json(['message' => 'Gagal menghapus data tipe dokumen.'], 500);
        }
    }
}

