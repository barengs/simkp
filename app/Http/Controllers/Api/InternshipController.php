<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\Internship;
use App\Models\Lecturer;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class InternshipController extends Controller
{
    public function index(Request $request)
    {
        $query = Internship::with(['student.user', 'company', 'theme', 'period', 'lecturer.user']);

        if ($request->has('status')) {
            $query->whereIn('status', explode(',', $request->status));
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->whereHas('student.user', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('nim', 'like', "%{$search}%");
            });
        }

        return response()->json($query->latest()->get());
    }

    public function myInternship(Request $request)
    {
        $internship = Internship::with(['student.user', 'company', 'theme', 'period', 'lecturer.user'])
            ->where('student_id', $request->user()->student->id)
            ->latest()
            ->first();

        return response()->json($internship);
    }

    public function myHistory(Request $request)
    {
        $history = Internship::with(['student.user', 'company', 'theme', 'period', 'lecturer.user'])
            ->where('student_id', $request->user()->student->id)
            ->latest()
            ->get();

        return response()->json($history);
    }

    public function registerKp(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'company_id' => 'required|exists:companies,id',
            'theme_id' => 'required|exists:themes,id',
            'period_id' => 'required|exists:periods,id',
            'proposal' => $request->hasFile('proposal') ? 'required|file|mimes:pdf,doc,docx|max:5120' : 'nullable',
            'krs' => $request->hasFile('krs') ? 'required|file|mimes:pdf,doc,docx|max:5120' : 'nullable',
            'ktm' => $request->hasFile('ktm') ? 'required|file|mimes:pdf,jpg,png|max:5120' : 'nullable',
            'recommendation' => 'nullable|file|mimes:pdf,jpg,png|max:5120',
            'status' => 'required|in:draft,submitted',
        ], [
            'required' => ':attribute wajib diisi.',
            'exists' => ':attribute tidak valid.',
            'mimes' => ':attribute harus berupa file :values.',
            'max' => ':attribute tidak boleh lebih dari 5MB.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        $student = $request->user()->student;

        // Check if there's an existing internship for this period
        $internship = Internship::where('student_id', $student->id)
            ->where('period_id', $request->period_id)
            ->first();

        if (!$internship) {
            $internship = new Internship();
            $internship->student_id = $student->id;
        } else if ($internship->status != 'draft' && $internship->status != 'rejected') {
            return response()->json(['message' => 'Anda sudah memiliki pendaftaran yang sedang diproses.'], 400);
        }

        $internship->period_id = $request->period_id;
        $internship->company_id = $request->company_id;
        $internship->theme_id = $request->theme_id;
        $internship->status = $request->status;

        $files = [
            'proposal' => 'proposal_url',
            'krs' => 'krs_url',
            'ktm' => 'ktp_url', // database uses ktp_url
            'recommendation' => 'surat_rekomendasi_url'
        ];

        foreach ($files as $input => $column) {
            if ($request->hasFile($input)) {
                if ($internship->$column) {
                    Storage::disk('public')->delete(str_replace('/storage/', '', $internship->$column));
                }
                $path = $request->file($input)->store('internships', 'public');
                $internship->$column = Storage::url($path);
            }
        }

        $internship->save();

        return response()->json([
            'message' => $request->status == 'draft' ? 'Draft berhasil disimpan' : 'Pendaftaran berhasil dikirim',
            'data' => $internship
        ]);
    }

    public function updateStatus(Request $request, Internship $internship)
    {
        $request->validate([
            'status' => 'required|in:approved,rejected',
            'notes' => 'nullable|string'
        ]);

        $internship->status = $request->status;
        // Assuming we might want to store notes somewhere, for now just update status
        $internship->save();

        return response()->json(['message' => 'Status pendaftaran berhasil diperbarui']);
    }

    public function plotLecturer(Request $request, Internship $internship)
    {
        $request->validate([
            'lecturer_id' => 'required|exists:lecturers,id'
        ]);

        $internship->supervisor_id = $request->lecturer_id;
        $internship->status = 'ongoing';
        $internship->save();

        return response()->json(['message' => 'Dosen pembimbing berhasil di-plot']);
    }
}
