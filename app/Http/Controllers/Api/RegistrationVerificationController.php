<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateVerifikasiRequest;
use App\Http\Resources\RegistrationVerificationResource;
use App\Services\RegistrationVerificationService;
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
            $updated = $this->verificationService->update($id, $request->validated());
            return response()->json(new RegistrationVerificationResource($updated));
        } catch (\Throwable $e) {
            return response()->json(['message' => 'Gagal memperbarui verifikasi pendaftaran.'], 500);
        }
    }
}
