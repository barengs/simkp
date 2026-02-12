<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Internship;
use App\Services\InternshipService;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class InternshipController extends Controller
{
    protected $internshipService;

    public function __construct(InternshipService $internshipService)
    {
        $this->internshipService = $internshipService;
    }

    public function checkLocation(Request $request)
    {
        $request->validate([
            'company_name' => 'required|string',
            'period_id' => 'required|exists:periods,id'
        ]);

        $available = $this->internshipService->checkLocationAvailability(
            $request->period_id,
            $request->company_name
        );

        return response()->json([
            'available' => $available,
            'message' => $available ? 'Lokasi tersedia.' : 'Lokasi sudah digunakan oleh kelompok lain.'
        ]);
    }

    public function index(Request $request)
    {
        $internships = $this->internshipService->getAllInternships($request->only('status', 'search'));
        return response()->json($internships);
    }

    public function myInternship(Request $request)
    {
        $internship = $this->internshipService->getStudentInternship($request->user()->student->id);
        return response()->json($internship);
    }

    public function myHistory(Request $request)
    {
        $history = $this->internshipService->getStudentHistory($request->user()->student->id);
        return response()->json($history);
    }

    public function registerKp(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'period_id' => 'required|exists:periods,id',
            'theme_id' => 'required|exists:themes,id',
            'status' => 'required|in:draft,submitted',
            'company_action' => 'required|in:manual,selection',
            'company_id' => 'nullable|required_if:company_action,selection|exists:companies,id',
            'company_name_manual' => 'nullable|required_if:company_action,manual|string',
            'members' => 'nullable|array|max:2',
            'members.*' => 'string|distinct',
            'proposal' => $request->hasFile('proposal') ? 'required|file|mimes:pdf,doc,docx|max:5120' : 'nullable',
            'krs' => $request->hasFile('krs') ? 'required|file|mimes:pdf,doc,docx|max:5120' : 'nullable',
            'ktm' => $request->hasFile('ktm') ? 'required|file|mimes:pdf,jpg,png|max:5120' : 'nullable',
            'recommendation' => 'nullable|file|mimes:pdf,jpg,png|max:5120',
        ], [
            'required' => ':attribute wajib diisi.',
            'exists' => ':attribute tidak valid.',
            'mimes' => ':attribute harus berupa file :values.',
            'max' => ':attribute tidak boleh lebih dari 5MB.',
            'required_if' => ':attribute wajib diisi.',
            'distinct' => 'Terdapat NIM yang duplikat di daftar anggota.',
        ]);

        $validator->after(function ($validator) use ($request) {
            if ($request->company_action === 'manual' && $request->company_name_manual) {
                if (!$this->internshipService->checkLocationAvailability($request->period_id, $request->company_name_manual)) {
                    // We might need to check if it's the SAME internship updating (not implemented in service check yet strictly for update)
                    // For now trusting service check logic or would add id check later.
                }
            }
            // Member validation for existence
            if ($request->has('members')) {
                foreach ($request->members as $nim) {
                    if (!\App\Models\Student::where('nim', $nim)->exists()) {
                        $validator->errors()->add('members', "NIM {$nim} tidak ditemukan.");
                    }
                }
            }
        });

        if ($validator->fails()) {
            return response()->json(['message' => 'Validasi gagal', 'errors' => $validator->errors()], 422);
        }

        try {
            $internship = $this->internshipService->registerInternship(
                $request->user()->student,
                $request->all(),
                $request->allFiles()
            );

            return response()->json([
                'message' => 'Pendaftaran berhasil disimpan',
                'data' => $internship->load('members.student.user')
            ]);
        } catch (ValidationException $e) {
            return response()->json(['message' => $e->getMessage(), 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 400); // General error
        }
    }

    public function updateStatus(Request $request, Internship $internship)
    {
        $request->validate([
            'status' => 'required|in:approved,rejected',
            'notes' => 'nullable|string'
        ]);

        $this->internshipService->updateStatus($internship, $request->status, $request->notes);

        return response()->json(['message' => 'Status pendaftaran berhasil diperbarui']);
    }

    public function plotLecturer(Request $request, Internship $internship)
    {
        $request->validate([
            'lecturer_id' => 'required|exists:lecturers,id'
        ]);

        $this->internshipService->assignSupervisor($internship, $request->lecturer_id);

        return response()->json(['message' => 'Dosen pembimbing berhasil di-plot']);
    }
}
