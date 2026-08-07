<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreStudyProgramRequest;
use App\Http\Requests\UpdateStudyProgramRequest;
use App\Http\Resources\StudyProgramResource;
use App\Services\StudyProgramService;
use Illuminate\Http\Request;

class StudyProgramController extends Controller
{
    public function __construct(
        private readonly StudyProgramService $sService
    ) {
        $this->middleware('auth:sanctum');
        $this->middleware('permission:master-data.manage');
    }

    public function index()
    {
        return response()->json($this->sService->getAll());
    }

    public function store(StoreStudyProgramRequest $request)
    {
        $s = $this->sService->create($request->validated());
        return response()->json(new StudyProgramResource($s), 201);
    }

    public function show(int $id)
    {
        $s = $this->sService->getById($id);
        return response()->json(new StudyProgramResource($s));
    }

    public function update(UpdateStudyProgramRequest $request, int $id)
    {
        $s = $this->sService->update($id, $request->validated());
        return response()->json(new StudyProgramResource($s));
    }

    public function destroy(int $id)
    {
        $this->sService->delete($id);
        return response()->json(['message' => 'Deleted']);
    }
}
