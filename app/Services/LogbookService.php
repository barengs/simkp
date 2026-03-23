<?php

namespace App\Services;

use App\Models\Logbook;
use App\Models\Student;
use App\Models\Internship;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class LogbookService
{
    public function getStudentLogbooks(Student $student)
    {
        // Get active internship for student
        $internship = Internship::whereHas('members', function ($q) use ($student) {
            $q->where('student_id', $student->id);
        })->whereIn('status', ['ongoing', 'grading', 'finished'])->first();

        if (!$internship) {
            return [];
        }

        // Return logbooks ONLY for this student
        return Logbook::where('internship_id', $internship->id)
            ->where('student_id', $student->id)
            ->latest('date')
            ->get();
    }

    public function createLogbook(Student $student, array $data, ?UploadedFile $file): Logbook
    {
        // Get active internship
        $internship = Internship::whereHas('members', function ($q) use ($student) {
            $q->where('student_id', $student->id);
        })->where('status', 'ongoing')->first();

        if (!$internship) {
            throw ValidationException::withMessages(['message' => 'Anda belum terdaftar di KP yang aktif/ongoing.']);
        }

        $logbook = new Logbook();
        $logbook->internship_id = $internship->id;
        $logbook->student_id = $student->id;
        $logbook->date = $data['date'];
        $logbook->activity = $data['activity'];
        $logbook->status = 'pending';

        if ($file) {
            $path = $file->store('logbooks', 'public');
            $logbook->evidence_photo = Storage::url($path);
        }

        $logbook->save();

        return $logbook;
    }

    public function getLogbooksForLecturer($lecturer)
    {
        // Get logbooks from internships where this lecturer is supervisor
        return Logbook::with(['internship.leader.user', 'student.user'])
            ->whereHas('internship', function ($q) use ($lecturer) {
                $q->where('supervisor_id', $lecturer->id);
            })
            ->latest('date')
            ->get();
    }

    public function validateLogbook(Logbook $logbook, string $status, ?string $reason = null): Logbook
    {
        $logbook->status = $status;
        if ($status === 'rejected') {
            $logbook->rejection_reason = $reason;
        } else {
            $logbook->rejection_reason = null;
        }
        $logbook->save();
        return $logbook;
    }
}
