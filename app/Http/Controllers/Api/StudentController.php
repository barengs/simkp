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
        return StudentResource::collection($this->studentService->getAll());
    }

    public function store(StoreStudentRequest $request)
    {
        $validated = $request->validated();
        
        // Prepare data for service
        $data = [
            'nim' => $validated['nim'],
            'study_program_id' => $validated['study_program_id'],
            'is_active' => $validated['is_active'] ?? true,
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone_number' => $validated['phone_number'] ?? null,
            'password' => $validated['password'] ?? 'mhs123',
        ];
        
        $student = $this->studentService->create($data);
        return response()->json(new StudentResource($student), 201);
    }

    public function show(int $id)
    {
        $student = $this->studentService->getById($id);
        return response()->json(new StudentResource($student));
    }

    public function update(UpdateStudentRequest $request, int $id)
    {
        $validated = $request->validated();
        
        // Prepare data for service
        $data = [
            'nim' => $validated['nim'],
            'study_program_id' => $validated['study_program_id'],
            'is_active' => $validated['is_active'] ?? true,
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone_number' => $validated['phone_number'] ?? null,
        ];
        
        $student = $this->studentService->update($id, $data);
        return response()->json(new StudentResource($student));
    }

    public function destroy(int $id)
    {
        $this->studentService->delete($id);
        return response()->json(['message' => 'Deleted']);
    }
}
