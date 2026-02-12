<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Lecturer;
use Illuminate\Http\Request;
use App\Services\LecturerService;
use Illuminate\Validation\ValidationException;

class LecturerController extends Controller
{
    protected $lecturerService;

    public function __construct(LecturerService $lecturerService)
    {
        $this->lecturerService = $lecturerService;
    }

    public function index(Request $request)
    {
        $lecturers = $this->lecturerService->getAllLecturers(
            $request->only('search'),
            $request->get('per_page', 10)
        );

        return response()->json([
            'status' => 'success',
            'data' => $lecturers
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email',
            'password' => 'required|min:6',
            'nip' => 'required|string',
            'phone' => 'required|string'
        ]);

        try {
            $lecturer = $this->lecturerService->createLecturer($request->all());

            return response()->json([
                'status' => 'success',
                'message' => 'Dosen berhasil ditambahkan ke periode ini',
                'data' => $lecturer->load('user')
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
                'message' => 'Gagal menambahkan dosen: ' . $error->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        $lecturer = Lecturer::findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email',
            'nip' => 'required|string',
            'phone' => 'required|string',
            'password' => 'nullable|min:6'
        ]);

        try {
            $updatedLecturer = $this->lecturerService->updateLecturer($lecturer, $request->all());

            return response()->json([
                'status' => 'success',
                'message' => 'Dosen berhasil diperbarui',
                'data' => $updatedLecturer->load('user')
            ]);
        } catch (\Exception $error) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal memperbarui dosen: ' . $error->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        $lecturer = Lecturer::findOrFail($id);

        try {
            $this->lecturerService->deleteLecturer($lecturer);

            return response()->json([
                'status' => 'success',
                'message' => 'Data dosen di periode ini berhasil dihapus'
            ]);
        } catch (\Exception $error) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal menghapus dosen: ' . $error->getMessage()
            ], 500);
        }
    }
}

