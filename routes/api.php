<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\SettingsController;

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

    Route::get('/pengaturan', [SettingsController::class, 'index']);
    Route::put('/pengaturan', [SettingsController::class, 'update']);
});
