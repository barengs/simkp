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
    Route::apiResource('students', \App\Http\Controllers\Api\StudentController::class);
    Route::apiResource('periods', PeriodController::class);
    Route::apiResource('companies', \App\Http\Controllers\Api\CompanyController::class);
    Route::apiResource('themes', \App\Http\Controllers\Api\ThemeController::class);
    Route::post('/periods/{period}/activate', [PeriodController::class, 'activate']);
});