<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\LogbookController;
use App\Http\Controllers\Api\EvaluationController;
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

    // Internships Listing for Admin/Dosen
    Route::get('internships/groups', [\App\Http\Controllers\Api\InternshipController::class, 'listGroups']);

    // Internships (KP)
    Route::apiResource('internships', \App\Http\Controllers\Api\InternshipController::class);

    // Logbooks
    Route::apiResource('logbooks', LogbookController::class);
    Route::post('logbooks/{logbook}/approve', [LogbookController::class, 'approve']);

    Route::apiResource('reports', \App\Http\Controllers\Api\ReportController::class);
    Route::post('reports/{report}/approve', [\App\Http\Controllers\Api\ReportController::class, 'approve']);
    Route::post('reports/{report}/reject', [\App\Http\Controllers\Api\ReportController::class, 'reject']);

    // Admin Internship Validation & Plotting
    Route::prefix('admin/internships')->group(function () {
        Route::get('submitted', [\App\Http\Controllers\Api\Admin\InternshipController::class, 'submitted']);
        Route::get('approved', [\App\Http\Controllers\Api\Admin\InternshipController::class, 'approved']);
        Route::post('{id}/approve', [\App\Http\Controllers\Api\Admin\InternshipController::class, 'approve']);
        Route::post('{id}/reject', [\App\Http\Controllers\Api\Admin\InternshipController::class, 'reject']);
        Route::post('{id}/assign-supervisor', [\App\Http\Controllers\Api\Admin\InternshipController::class, 'assignSupervisor']);
    });
    
    // Evaluations
    Route::apiResource('evaluations', EvaluationController::class);

    // Settings (Admin)
    Route::get('settings', [\App\Http\Controllers\Api\SettingController::class, 'index']);
    Route::post('settings', [\App\Http\Controllers\Api\SettingController::class, 'update']);
});

// Settings Public (for Branding/Logo/Name)
Route::get('settings/public', [\App\Http\Controllers\Api\SettingController::class, 'getKeyValue']);
