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
use App\Http\Controllers\Api\LogbookController;
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

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public routes
Route::post('/login', [AuthController::class, 'login']);
Route::get('/setting/public', [SettingController::class, 'public']);

// Authenticated routes
Route::middleware(['auth:sanctum'])->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

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
    Route::apiResource('kp-group', KpGroupController::class);
    Route::apiResource('document-type', DocumentTypeController::class);
    Route::apiResource('room', RoomController::class);
    Route::apiResource('guidance', GuidanceController::class);
    Route::apiResource('report', ReportController::class);
    Route::apiResource('exam-schedule', ExamScheduleController::class);
    Route::apiResource('evaluation-criteria', EvaluationCriteriaController::class);
    Route::apiResource('kp-grade', KpGradeController::class);
    Route::apiResource('exam-grade', ExamGradeController::class);
    Route::apiResource('notification', NotificationController::class);
    Route::apiResource('status-history', StatusHistoryController::class);
    Route::apiResource('activity-log', ActivityLogController::class);

    // KP Module
    Route::apiResource('kp-group/kp-company', KpCompanyController::class)->shallow();
    Route::apiResource('kp-group/kp-theme', KpThemeController::class)->shallow();
    Route::apiResource('kp-group/academic-period', AcademicPeriodController::class)->shallow();
    Route::apiResource('registration-verification', RegistrationVerificationController::class)
        ->only(['index', 'show', 'update']);
    Route::apiResource('logbook', LogbookController::class);
});
