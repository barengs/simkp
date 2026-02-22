<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Services\InternshipService;
use Illuminate\Http\Request;
use App\Http\Resources\InternshipResource;

class InternshipController extends Controller
{
    protected $internshipService;

    public function __construct(InternshipService $internshipService)
    {
        $this->internshipService = $internshipService;
    }

    public function submitted()
    {
        $internships = $this->internshipService->getSubmittedInternships();
        return InternshipResource::collection($internships);
    }

    public function approved()
    {
        $internships = $this->internshipService->getApprovedInternships();
        return InternshipResource::collection($internships);
    }

    public function approve($id)
    {
        $internship = $this->internshipService->approveInternship($id);
        return (new InternshipResource($internship))->additional(['message' => 'Pendaftaran KP berhasil disetujui.']);
    }

    public function reject(Request $request, $id)
    {
        $request->validate([
            'note' => 'required|string'
        ]);
        $internship = $this->internshipService->rejectInternship($id, $request->note);
        return (new InternshipResource($internship))->additional(['message' => 'Pendaftaran KP berhasil ditolak.']);
    }

    public function assignSupervisor(Request $request, $id)
    {
        $request->validate([
            'supervisor_id' => 'required|exists:lecturers,id' // must exist in lecturers table
        ]);
        $internship = $this->internshipService->assignSupervisor($id, $request->supervisor_id);
        return (new InternshipResource($internship))->additional(['message' => 'Dosen Pembimbing berhasil diplot.']);
    }
}
