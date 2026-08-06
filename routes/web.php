<?php

use Illuminate\Support\Facades\Route;
use Illuminate\View\Factory;

// SPA entry point - React will handle client-side routing
Route::get('{any?}', fn() => view('index'))->where('any', '.*');
