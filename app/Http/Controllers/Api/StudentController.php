<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Services\StudentService;
use App\Http\Requests\StudentRequest;
use App\Http\Resources\StudentResource;
use App\Models\Student;

class StudentController extends Controller
{
    protected $studentService;

    public function __construct(StudentService $studentService)
    {
        $this->studentService = $studentService;
    }

    public function index()
    {
        $students = $this->studentService->getAllStudents();
        return StudentResource::collection($students);
    }

    public function store(StudentRequest $request)
    {
        $student = $this->studentService->createStudent($request->validated());
        return new StudentResource($student);
    }

    public function show(Student $student)
    {
        return new StudentResource($student);
    }

    public function update(StudentRequest $request, Student $student)
    {
        $updatedStudent = $this->studentService->updateStudent($student, $request->validated());
        return new StudentResource($updatedStudent);
    }

    public function destroy(Student $student)
    {
        $this->studentService->deleteStudent($student);
        return response()->json(null, 204);
    }

    public function resetPassword(Student $student)
    {
        try {
            $this->studentService->resetPassword($student);
            return response()->json(['message' => 'Password berhasil direset menjadi default (mhs123).']);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }
}
