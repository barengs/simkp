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
        $documentType = DocumentType::create($request->validated());
        return response()->json(new DocumentTypeResource($documentType), 201);
    }

    /**
     * Tampilkan detail tipe dokumen
     */
    public function show(DocumentType $documentType)
    {
        return response()->json(new DocumentTypeResource($documentType));
    }

    /**
     * Update tipe dokumen (admin-only)
     */
    public function update(UpdateDocumentTypeRequest $request, DocumentType $documentType)
    {
        $documentType->update($request->validated());
        return response()->json(new DocumentTypeResource($documentType));
    }

    /**
     * Hapus tipe dokumen (admin-only)
     */
    public function destroy(DocumentType $documentType)
    {
        // Jangan hapus jika sudah ada dokumen yang menggunakan tipe ini
        if ($documentType->documents()->exists()) {
            abort(422, 'Tipe dokumen ini sudah digunakan oleh dokumen lain. Tidak dapat dihapus.');
        }

        $documentType->delete();
        return response()->json(['message' => 'Tipe dokumen berhasil dihapus']);
    }
}

