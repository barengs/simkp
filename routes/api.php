<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\SettingsController;
use App\Http\Controllers\Api\ProgramStudiController;
use App\Http\Controllers\Api\MahasiswaController;
use App\Http\Controllers\Api\DosenController;
use App\Http\Controllers\Api\PerusahaanKpController;
use App\Http\Controllers\Api\TemaKpController;
use App\Http\Controllers\Api\PeriodeAkademikController;
use App\Http\Controllers\Api\KelompokKpController;
use App\Http\Controllers\Api\VerifikasiPendaftaranController;
use App\Http\Controllers\Api\LogbookController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public
Route::post('/login', [AuthController::class, 'login']);
Route::get('/pengaturan/public', [SettingsController::class, 'public']);

// Authenticated (Sanctum)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    // Settings
    Route::get('/pengaturan', [SettingsController::class, 'index']);
    Route::put('/pengaturan', [SettingsController::class, 'update']);

    // Master Data
    Route::apiResource('program-studi', ProgramStudiController::class);
    Route::apiResource('mahasiswa', MahasiswaController::class);
    Route::apiResource('dosen', DosenController::class);
    Route::apiResource('perusahaan-kp', PerusahaanKpController::class);
    Route::apiResource('tema-kp', TemaKpController::class);
    Route::apiResource('periode-akademik', PeriodeAkademikController::class);

    // KP Module
    Route::apiResource('kelompok-kp', KelompokKpController::class);
    Route::apiResource('verifikasi-pendaftaran', VerifikasiPendaftaranController::class)->only(['index', 'show', 'update']);
    Route::apiResource('logbook', LogbookController::class);
});
