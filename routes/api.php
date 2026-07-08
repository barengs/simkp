<?php

use App\Http\Controllers\Api\ActivityController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\LogbookController;
use App\Http\Controllers\Api\EvaluationController;
use App\Http\Controllers\Api\TugasAkhirController;
use App\Http\Controllers\Api\StudentBimbinganController;
use App\Http\Controllers\Api\StudentSidangController;
use App\Http\Controllers\Api\StudentRepositoryController;
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
Route::middleware('auth:api')->group(function () {
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
    // Internship Group Detail (Admin/Dosen)
    Route::get('internships/groups/{id}', [\App\Http\Controllers\Api\InternshipController::class, 'show']);

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

    // Dashboard stats
    Route::get('dashboard/stats', [DashboardController::class, 'getStats']);

    // Activities
    Route::get('activities', [ActivityController::class, 'index']);
    Route::get('activities/latest', [ActivityController::class, 'latest']);

    // Settings (Admin)
    Route::get('settings', [\App\Http\Controllers\Api\SettingController::class, 'index']);
    Route::post('settings', [\App\Http\Controllers\Api\SettingController::class, 'update']);

    // Tugas Akhir (TA)
    Route::get('student/eligibility-ta', [TugasAkhirController::class, 'eligibility']);
    Route::post('student/register-ta', [TugasAkhirController::class, 'register']);
    Route::get('student/my-ta', [TugasAkhirController::class, 'myTA']);

    // Student TA Modules
    Route::apiResource('student/bimbingan-ta', StudentBimbinganController::class)->only(['index', 'store', 'destroy']);
    Route::get('student/sidang-ta', [StudentSidangController::class, 'index']);
    Route::post('student/sidang-ta/upload-requirement', [StudentSidangController::class, 'uploadRequirement']);
    Route::post('student/sidang-ta/submit-revision/{nilaiUjianId}', [StudentSidangController::class, 'submitRevision']);
    Route::get('student/repository-ta', [StudentRepositoryController::class, 'show']);
    Route::post('student/repository-ta', [StudentRepositoryController::class, 'store']);

    // Koordinator / Admin — Manajemen Pengajuan TA
    Route::prefix('koordinator/ta')->group(function () {
        Route::get('/', [TugasAkhirController::class, 'index']);
        Route::post('{id}/approve', [TugasAkhirController::class, 'approve']);
        Route::post('{id}/reject', [TugasAkhirController::class, 'reject']);
        Route::post('{id}/assign-pembimbing', [TugasAkhirController::class, 'assignPembimbing']);
    });

    // Spatie RBAC Role-Based Access Control routes
    Route::prefix('admin')->group(function () {
        Route::get('roles', [\App\Http\Controllers\Api\RolePermissionController::class, 'index']);
        Route::post('roles', [\App\Http\Controllers\Api\RolePermissionController::class, 'store']);
        Route::put('roles/{id}', [\App\Http\Controllers\Api\RolePermissionController::class, 'update']);
        Route::delete('roles/{id}', [\App\Http\Controllers\Api\RolePermissionController::class, 'destroy']);
        Route::get('permissions', [\App\Http\Controllers\Api\RolePermissionController::class, 'permissions']);
        Route::get('users-list', [\App\Http\Controllers\Api\RolePermissionController::class, 'users']);
        Route::post('users-list/{id}/roles', [\App\Http\Controllers\Api\RolePermissionController::class, 'assignUserRoles']);
    });

    // Profile Management routes
    Route::prefix('profile')->group(function () {
        Route::put('/', [\App\Http\Controllers\Api\ProfileController::class, 'update']);
        Route::post('password', [\App\Http\Controllers\Api\ProfileController::class, 'changePassword']);
        Route::post('avatar', [\App\Http\Controllers\Api\ProfileController::class, 'uploadAvatar']);
    });
});

// Settings Public (for Branding/Logo/Name)
Route::get('settings/public', [\App\Http\Controllers\Api\SettingController::class, 'getKeyValue']);

