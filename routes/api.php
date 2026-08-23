<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\SettingController;
use App\Http\Controllers\Api\StudyProgramController;
use App\Http\Controllers\Api\StudentController;
use App\Http\Controllers\Api\LecturerController;
use App\Http\Controllers\Api\KpCompanyController;
use App\Http\Controllers\Api\KpThemeController;
use App\Http\Controllers\Api\AcademicPeriodController;
use App\Http\Controllers\Api\KpGroupController;
use App\Http\Controllers\Api\RegistrationVerificationController;
use App\Http\Controllers\Api\DocumentTypeController;
use App\Http\Controllers\Api\RoomController;
use App\Http\Controllers\Api\GuidanceController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\ExamScheduleController;
use App\Http\Controllers\Api\EvaluationCriteriaController;
use App\Http\Controllers\Api\KpGradeController;
use App\Http\Controllers\Api\ExamGradeController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\StatusHistoryController;
use App\Http\Controllers\Api\ActivityLogController;
use App\Http\Controllers\Api\KpDocumentController;
use App\Http\Controllers\Api\PlottingDosenController;
use App\Http\Controllers\Api\UserController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public routes
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
Route::get('/setting/public', [SettingController::class, 'public']);

// Authenticated routes
Route::middleware(['auth:sanctum'])->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    Route::put('/user/profile', [UserController::class, 'updateProfile']);

    // Settings
    Route::get('/setting', [SettingController::class, 'index']);
    Route::put('/setting', [SettingController::class, 'update']);

    // Master Data
    Route::apiResource('study-program', StudyProgramController::class);
    Route::apiResource('student', StudentController::class);
    Route::apiResource('lecturer', LecturerController::class);
    Route::apiResource('kp-company', KpCompanyController::class);
    Route::apiResource('kp-theme', KpThemeController::class);
    Route::apiResource('academic-period', AcademicPeriodController::class);
    Route::apiResource('document-type', DocumentTypeController::class);
    Route::apiResource('room', RoomController::class);

    // Role & Permission
    Route::get('/role', [\App\Http\Controllers\Api\RoleController::class, 'index']);
    Route::post('/role', [\App\Http\Controllers\Api\RoleController::class, 'store']);
    Route::get('/role/{id}', [\App\Http\Controllers\Api\RoleController::class, 'show']);
    Route::put('/role/{id}', [\App\Http\Controllers\Api\RoleController::class, 'update']);
    Route::delete('/role/{id}', [\App\Http\Controllers\Api\RoleController::class, 'destroy']);
    Route::get('/permission', function () {
        return response()->json(\Spatie\Permission\Models\Permission::select(['id', 'name'])->get());
    });

    // KP Module
    // Mahasiswa boleh mengajukan perusahaan baru (propose) tanpa master-data.manage
    Route::post('kp-company/propose', [KpCompanyController::class, 'propose']);
    Route::apiResource('kp-group', KpGroupController::class);
    Route::post('/kp-group/{id}/accept-invitation', [KpGroupController::class, 'acceptInvitation']);
    Route::post('/kp-group/{id}/decline-invitation', [KpGroupController::class, 'declineInvitation']);
    Route::apiResource('kp-document', KpDocumentController::class)->only(['store', 'destroy']);
    Route::apiResource('registration-verification', RegistrationVerificationController::class)
        ->only(['index', 'show', 'update']);

    // Plotting Dosen Pembimbing
    Route::prefix('kp-plotting')->group(function () {
        Route::get('/groups/unassigned', [PlottingDosenController::class, 'unassignedGroups']);
        Route::get('/groups/assigned', [PlottingDosenController::class, 'assignedGroups']);
        Route::get('/my-groups', [PlottingDosenController::class, 'myGroups']);
        Route::get('/lecturers', [PlottingDosenController::class, 'availableLecturers']);
        Route::post('/assign', [PlottingDosenController::class, 'assignSupervisor']);
        Route::delete('/groups/{kpGroupId}/remove', [PlottingDosenController::class, 'removeSupervisor']);
    });
    Route::apiResource('logbook', \App\Http\Controllers\Api\LogbookController::class);
    Route::apiResource('guidance', GuidanceController::class);
    Route::apiResource('report', ReportController::class);
    Route::apiResource('exam-schedule', ExamScheduleController::class);
    Route::apiResource('evaluation-criteria', EvaluationCriteriaController::class);
    Route::post('/kp-grade/group', [KpGradeController::class, 'storeGroupGrade']);
    Route::get('/kp-grade/supervised-groups', [KpGradeController::class, 'getSupervisedGroups']);
    Route::apiResource('kp-grade', KpGradeController::class);
    Route::apiResource('exam-grade', ExamGradeController::class);
    Route::apiResource('notification', NotificationController::class);
    Route::apiResource('status-history', StatusHistoryController::class);
    Route::apiResource('activity-log', ActivityLogController::class);

    // TA (Tugas Akhir) Module
    Route::apiResource('ta/pengajuan', \App\Http\Controllers\Api\FinalProjectController::class)->only(['index', 'store']);
    Route::put('ta/pengajuan/{id}/verifikasi-judul', [\App\Http\Controllers\Api\FinalProjectController::class, 'verify']);
    Route::put('ta/pengajuan/{id}/plotting-dosen', [\App\Http\Controllers\Api\FinalProjectController::class, 'assignSupervisor']);
    Route::get('ta/bimbingan/{finalProjectId}', [\App\Http\Controllers\Api\FinalProjectController::class, 'getBimbingan']);
    Route::post('ta/bimbingan/{finalProjectId}', [\App\Http\Controllers\Api\FinalProjectController::class, 'addBimbingan']);
    Route::put('ta/bimbingan/{finalProjectId}/{bimbinganId}', [\App\Http\Controllers\Api\FinalProjectController::class, 'updateBimbingan']);
    Route::delete('ta/bimbingan/{finalProjectId}/{bimbinganId}', [\App\Http\Controllers\Api\FinalProjectController::class, 'deleteBimbingan']);
});
