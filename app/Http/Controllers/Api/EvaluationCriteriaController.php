<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\EvaluationCriteriaResource;
use App\Models\EvaluationCriteria;
use Illuminate\Http\Request;

class EvaluationCriteriaController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
    }

    public function index()
    {
        return response()->json(
            EvaluationCriteriaResource::collection(EvaluationCriteria::where('is_active', true)->get())
        );
    }

    public function show(int $id)
    {
        $criteria = EvaluationCriteria::findOrFail($id);

        return response()->json(new EvaluationCriteriaResource($criteria));
    }
}
