<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PeriodController;

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'me']);

    Route::apiResource('lecturers', \App\Http\Controllers\Api\LecturerController::class);
    Route::get('/students/check', [\App\Http\Controllers\Api\StudentController::class, 'check']);
    Route::apiResource('students', \App\Http\Controllers\Api\StudentController::class);
    Route::apiResource('periods', PeriodController::class);
    Route::apiResource('companies', \App\Http\Controllers\Api\CompanyController::class);
    Route::apiResource('themes', \App\Http\Controllers\Api\ThemeController::class);
    Route::post('/periods/{period}/activate', [PeriodController::class, 'activate']);

    // Internship routes
    Route::get('/internships/my', [\App\Http\Controllers\Api\InternshipController::class, 'myInternship']);
    Route::get('/internships/my/history', [\App\Http\Controllers\Api\InternshipController::class, 'myHistory']);
    Route::get('/internships/check-location', [\App\Http\Controllers\Api\InternshipController::class, 'checkLocation']);
    Route::post('/internships/register', [\App\Http\Controllers\Api\InternshipController::class, 'registerKp']);

    Route::get('/admin/internships', [\App\Http\Controllers\Api\InternshipController::class, 'index']);
    Route::patch('/admin/internships/{internship}/status', [\App\Http\Controllers\Api\InternshipController::class, 'updateStatus']);
    Route::patch('/admin/internships/{internship}/plot', [\App\Http\Controllers\Api\InternshipController::class, 'plotLecturer']);
});