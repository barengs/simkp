<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreStudentRequest;
use App\Http\Requests\UpdateStudentRequest;
use App\Http\Resources\StudentResource;
use App\Services\StudentService;
use Illuminate\Http\Request;

class StudentController extends Controller
{
    public function __construct(
        private readonly StudentService $studentService
    ) {
        $this->middleware('auth:sanctum');
        $this->middleware('permission:master-data.manage');
    }

    public function index()
    {
        return response()->json($this->studentService->getAll());
    }

    public function store(StoreStudentRequest $request)
    {
        $student = $this->studentService->create($request->validated());
        return response()->json(new StudentResource($student), 201);
    }

    public function show(int $id)
    {
        $student = $this->studentService->getById($id);
        return response()->json(new StudentResource($student));
    }

    public function update(UpdateStudentRequest $request, int $id)
    {
        $student = $this->studentService->update($id, $request->validated());
        return response()->json(new StudentResource($student));
    }

    public function destroy(int $id)
    {
        $this->studentService->delete($id);
        return response()->json(['message' => 'Deleted']);
    }
}
