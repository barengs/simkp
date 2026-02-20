<?php

use App\Http\Controllers\Api\AuthController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Auth Routes (no middleware)
|--------------------------------------------------------------------------
*/
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

/*
|--------------------------------------------------------------------------
| Protected Routes (auth:sanctum)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/user', [AuthController::class, 'user']);
    Route::post('/auth/complete-profile', [AuthController::class, 'completeProfile']);

    // Students
    Route::apiResource('students', \App\Http\Controllers\Api\StudentController::class);
    Route::post('students/{student}/reset-password', [\App\Http\Controllers\Api\StudentController::class, 'resetPassword']);

    // Periods
    Route::apiResource('periods', \App\Http\Controllers\Api\PeriodController::class);
    Route::post('periods/{period}/toggle-active', [\App\Http\Controllers\Api\PeriodController::class, 'toggleActive']);
});
