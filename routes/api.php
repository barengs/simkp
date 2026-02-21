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

    // Lecturers (Dosen)
    Route::apiResource('lecturers', \App\Http\Controllers\Api\LecturerController::class);
    Route::post('lecturers/{lecturer}/reset-password', [\App\Http\Controllers\Api\LecturerController::class, 'resetPassword']);

    // Companies (Mitra)
    Route::apiResource('companies', \App\Http\Controllers\Api\CompanyController::class);
    Route::post('companies/{company}/toggle-verified', [\App\Http\Controllers\Api\CompanyController::class, 'toggleVerified']);

    // Themes
    Route::apiResource('themes', \App\Http\Controllers\Api\ThemeController::class);

    // Periods
    Route::apiResource('periods', \App\Http\Controllers\Api\PeriodController::class);
    Route::post('periods/{period}/toggle-active', [\App\Http\Controllers\Api\PeriodController::class, 'toggleActive']);

    // Internships (KP)
    Route::apiResource('internships', \App\Http\Controllers\Api\InternshipController::class);
});
