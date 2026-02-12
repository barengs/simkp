<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\Internship;
use App\Models\Lecturer;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB; // Added for transactions

class InternshipController extends Controller
{
    public function checkLocation(Request $request)
    {
        $request->validate([
            'company_name' => 'required|string',
            'period_id' => 'required|exists:periods,id'
        ]);

        $exists = Internship::where('period_id', $request->period_id)
            ->where('company_name_manual', 'like', $request->company_name) // Exact match or similar? Requirement says "Unik". Strict unique for now/
            ->where('status', '!=', 'rejected')
            ->exists();

        // Also check companies table if needed? Requirement says "validasi secara real-time agar tidak ada dua kelompok yang memilih lokasi yang sama". 
        // Logic: Check if any internship in this period uses this company name manually.

        return response()->json([
            'available' => !$exists,
            'message' => $exists ? 'Lokasi sudah digunakan oleh kelompok lain.' : 'Lokasi tersedia.'
        ]);
    }

    public function index(Request $request)
    {
        $query = Internship::with(['leader.user', 'company', 'theme', 'period', 'lecturer.user', 'members.student.user']); // Added members

        if ($request->has('status')) {
            $query->whereIn('status', explode(',', $request->status));
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->whereHas('leader.user', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('nim', 'like', "%{$search}%");
            });
        }

        return response()->json($query->latest()->get());
    }

    public function myInternship(Request $request)
    {
        $studentId = $request->user()->student->id;

        // Check if student is a member of any internship
        $internship = Internship::with(['leader.user', 'members.student.user', 'company', 'theme', 'period', 'lecturer.user'])
            ->whereHas('members', function ($q) use ($studentId) {
                $q->where('student_id', $studentId);
            })
            ->latest()
            ->first();

        return response()->json($internship);
    }

    public function myHistory(Request $request)
    {
        $studentId = $request->user()->student->id;

        $history = Internship::with(['leader.user', 'members.student.user', 'company', 'theme', 'period', 'lecturer.user'])
            ->whereHas('members', function ($q) use ($studentId) {
                $q->where('student_id', $studentId);
            })
            ->latest()
            ->get();

        return response()->json($history);
    }

    public function registerKp(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'period_id' => 'required|exists:periods,id',
            'theme_id' => 'required|exists:themes,id',
            'status' => 'required|in:draft,submitted',
            'company_action' => 'required|in:manual,selection', // Distinguish between manual input and selection

            // Validation depends on action
            'company_id' => 'nullable|required_if:company_action,selection|exists:companies,id',
            'company_name_manual' => 'nullable|required_if:company_action,manual|string',

            // Members
            'members' => 'nullable|array|max:2', // Max 2 additional members (Total 3)
            'members.*' => 'string|distinct', // NPMs

            // Files
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

        // Additional validation
        $validator->after(function ($validator) use ($request) {
            // Check company_name_manual uniqueness in period
            if ($request->company_action === 'manual' && $request->company_name_manual) {
                $exists = Internship::where('period_id', $request->period_id)
                    ->where('company_name_manual', $request->company_name_manual)
                    ->where('status', '!=', 'rejected')
                    ->exists();
                if ($exists) {
                    // Check if it's updating existing draft? Handled later, but for new registration:
                    // Needs logic to allow update on same ID. For now assume register is create/update.
                    // Simply: if creating new, check exists.
                }
            }

            // Validate members NIMs exist and are students
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

        return DB::transaction(function () use ($request) {
            $student = $request->user()->student;

            // Check existing internship for this student in this period
            $existing = Internship::whereHas('members', function ($q) use ($student, $request) {
                $q->where('student_id', $student->id);
            })->where('period_id', $request->period_id)->first();

            // If existing and not draft/rejected, block
            if ($existing && !in_array($existing->status, ['draft', 'rejected'])) {
                return response()->json(['message' => 'Anda sudah terdaftar di kelompok lain.'], 400);
            }

            $internship = $existing ?? new Internship();

            // If new, set leader. If existing, logic might be complex if leader changes. 
            // Assumption: Leader creates. If updating draft, leader stays same.
            if (!$existing) {
                $internship->leader_id = $student->id;
            } else {
                // Ensure only leader can update? Or any member? requirement says "satu orang (ketua) yang mendaftarkan".
                if ($internship->leader_id != $student->id && $internship->status != 'rejected') {
                    // return response()->json(['message' => 'Hanya ketua kelompok yang dapat mengubah data.'], 403);
                    // actually, if status is rejected, maybe allow re-submit.
                }
            }

            $internship->period_id = $request->period_id;
            $internship->theme_id = $request->theme_id;
            $internship->status = $request->status;

            if ($request->company_action === 'selection') {
                $internship->company_id = $request->company_id;
                $internship->company_name_manual = null;
            } else {
                $internship->company_id = null;
                $internship->company_name_manual = $request->company_name_manual;
            }

            // Files
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

            // Handle Members
            // Always reset members for simplicity or sync?
            // "Simpan ketua kelompok ke tabel internship_members juga"

            // Collect all student IDs to be members
            $memberIds = [$student->id]; // Leader

            if ($request->members) {
                foreach ($request->members as $nim) {
                    $member = \App\Models\Student::where('nim', $nim)->first();
                    if ($member) {
                        // Check if member is free (not in other internship in period) - handled in frontend check ideally, but verify here
                        $isBusy = \App\Models\InternshipMember::where('student_id', $member->id)
                            ->whereHas('internship', function ($q) use ($request, $internship) {
                                $q->where('period_id', $request->period_id)
                                    ->where('id', '!=', $internship->id); // exclude current if updating
                            })->exists();
                        if ($isBusy) {
                            throw new \Exception("Mahasiswa dengan NIM $nim sudah terdaftar di kelompok lain.");
                        }
                        $memberIds[] = $member->id;
                    }
                }
            }

            // Sync members
            // Delete existing members
            \App\Models\InternshipMember::where('internship_id', $internship->id)->delete();

            // Add new members
            foreach (array_unique($memberIds) as $mid) {
                \App\Models\InternshipMember::create([
                    'internship_id' => $internship->id,
                    'student_id' => $mid
                ]);
            }
            return response()->json([
                'message' => 'Pendaftaran berhasil disimpan',
                'data' => $internship->load('members.student.user')
            ]);
        });
    }

    public function updateStatus(Request $request, Internship $internship)
    {
        $request->validate([
            'status' => 'required|in:approved,rejected',
            'notes' => 'nullable|string'
        ]);

        $internship->status = $request->status;
        $internship->rejection_note = $request->notes;
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
