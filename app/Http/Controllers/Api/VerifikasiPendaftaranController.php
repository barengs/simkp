<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateVerifikasiRequest;
use App\Services\KelompokKpService;
use Illuminate\Http\Request;

class VerifikasiPendaftaranController extends Controller
{
    public function __construct(
        private readonly KelompokKpService $kelompokKpService
    ) {
        $this->middleware('auth:sanctum');
        $this->middleware('permission:kp.verifikasi-pendaftaran');
    }

    public function index()
    {
        return response()->json($this->kelompokKpService->getAll());
    }

    public function show(int $id)
    {
        $kelompok = $this->kelompokKpService->getById($id);
        return response()->json($kelompok);
    }

    public function update(UpdateVerifikasiRequest $request, int $id)
    {
        $kelompok = $this->kelompokKpService->getById($id);
        $updated = $this->kelompokKpService->update($id, $request->validated());

        return response()->json($updated);
    }
}
