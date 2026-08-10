<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateVerifikasiRequest;
use App\Services\KpGroupService;
use Illuminate\Http\Request;
// use App\Http\Controllers\Api\KpGroupService;

class RegistrationVerificationController extends Controller
{
    public function __construct(
        private readonly KpGroupService $kpGroupService
    ) {
        $this->middleware('auth:sanctum');
        $this->middleware('permission:kp.verifikasi-pendaftaran');
    }

    public function index()
    {
        return response()->json($this->kpGroupService->getAll());
    }

    public function show(int $id)
    {
        $kelompok = $this->kpGroupService->getById($id);
        return response()->json($kelompok);
    }

    public function update(UpdateVerifikasiRequest $request, int $id)
    {
        $kelompok = $this->kpGroupService->getById($id);
        $updated = $this->kpGroupService->update($id, $request->validated());

        return response()->json($updated);
    }
}
