<?php

namespace App\Services;

use App\Models\Logbook;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class LogbookService
{
    public function getAllLogbooks()
    {
        return Logbook::with('internship.company', 'internship.leader.user')->latest()->get();
    }
    
    public function getLogbooksBySupervisor($supervisorId)
    {
        return Logbook::with('internship.company', 'internship.leader.user')
            ->whereHas('internship', function($q) use ($supervisorId) {
                $q->where('supervisor_id', $supervisorId);
            })
            ->latest()
            ->get();
    }
    
    public function getLogbooksByStudent($studentId)
    {
        return Logbook::with('internship.company', 'internship.leader.user')
            ->whereHas('internship.students', function($q) use ($studentId) {
                $q->where('student_id', $studentId);
            })
            ->latest()
            ->get();
    }

    public function createLogbook(array $data)
    {
        try {
            if (isset($data['evidence_photo']) && $data['evidence_photo'] instanceof \Illuminate\Http\UploadedFile) {
                $data['evidence_photo'] = $data['evidence_photo']->store('logbooks', 'public');
            }

            return Logbook::create($data);
        } catch (\Exception $e) {
            Log::error('Failed to create logbook: ' . $e->getMessage());
            throw $e;
        }
    }

    public function updateLogbook(Logbook $logbook, array $data)
    {
        try {
            if (isset($data['evidence_photo']) && $data['evidence_photo'] instanceof \Illuminate\Http\UploadedFile) {
                if ($logbook->evidence_photo) {
                    Storage::disk('public')->delete($logbook->evidence_photo);
                }
                $data['evidence_photo'] = $data['evidence_photo']->store('logbooks', 'public');
            } else {
                // If evidence_photo is not present or not an uploaded file, we don't update it to empty unless explicitly told to.
                // In an API form data, if evidence photo is empty, it might mean "no change".
                unset($data['evidence_photo']);
            }

            $logbook->update($data);
            return $logbook;
        } catch (\Exception $e) {
            Log::error('Failed to update logbook: ' . $e->getMessage());
            throw $e;
        }
    }

    public function deleteLogbook(Logbook $logbook)
    {
        try {
            if ($logbook->evidence_photo) {
                Storage::disk('public')->delete($logbook->evidence_photo);
            }
            return $logbook->delete();
        } catch (\Exception $e) {
            Log::error('Failed to delete logbook: ' . $e->getMessage());
            throw $e;
        }
    }

    public function updateStatus(Logbook $logbook, string $status)
    {
        try {
            $logbook->update(['status' => $status]);
            return $logbook;
        } catch (\Exception $e) {
            Log::error('Failed to update logbook status: ' . $e->getMessage());
            throw $e;
        }
    }
}
