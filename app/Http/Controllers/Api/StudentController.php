<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Student;
use Illuminate\Http\Request;
use App\Services\StudentService;
use Illuminate\Validation\ValidationException;

class StudentController extends Controller
{
    protected $studentService;

    public function __construct(StudentService $studentService)
    {
        $this->studentService = $studentService;
    }

    public function index(Request $request)
    {
        $students = $this->studentService->getAllStudents(
            $request->only('search'),
            $request->get('per_page', 10)
        );

        return response()->json([
            'status' => 'success',
            'data' => $students
        ]);
    }

    public function check(Request $request)
    {
        $request->validate([
            'npm' => 'required|string',
            'period_id' => 'required|exists:periods,id'
        ]);

        try {
            $result = $this->studentService->checkAvailability($request->npm, $request->period_id);
            return response()->json($result);
        } catch (ValidationException $e) {
            return response()->json(['message' => $e->getMessage()], 404);
        }
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email',
            'password' => 'required|min:6',
            'nim' => 'required|string',
            'major' => 'required|string',
            'batch_year' => 'required|integer',
            'phone' => 'required|string',
        ]);

        try {
            $student = $this->studentService->createStudent($request->all());

            return response()->json([
                'status' => 'success',
                'message' => 'Mahasiswa berhasil ditambahkan ke periode ini',
                'data' => $student->load('user')
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage(),
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $error) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal menambahkan mahasiswa: ' . $error->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        $student = Student::findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email',
            'nim' => 'required|string',
            'major' => 'required|string',
            'batch_year' => 'required|integer',
            'phone' => 'required|string',
            'password' => 'nullable|min:6'
        ]);

        try {
            $updatedStudent = $this->studentService->updateStudent($student, $request->all());

            return response()->json([
                'status' => 'success',
                'message' => 'Mahasiswa berhasil diperbarui',
                'data' => $updatedStudent->load('user')
            ]);
        } catch (\Exception $error) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal memperbarui mahasiswa: ' . $error->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        $student = Student::findOrFail($id);

        try {
            $this->studentService->deleteStudent($student);

            return response()->json([
                'status' => 'success',
                'message' => 'Data mahasiswa di periode ini berhasil dihapus'
            ]);
        } catch (\Exception $error) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal menghapus mahasiswa: ' . $error->getMessage()
            ], 500);
        }
    }
}

