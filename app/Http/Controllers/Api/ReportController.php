<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ReportRequest;
use App\Http\Resources\ReportResource;
use App\Models\Report;
use App\Services\ReportService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class ReportController extends Controller
{
    protected $reportService;

    public function __construct(ReportService $reportService)
    {
        $this->reportService = $reportService;
    }

    /**
     * Display a listing of the reports.
     */
    public function index(Request $request)
    {
        $reports = $this->reportService->getReports($request->user());
        return ReportResource::collection($reports);
    }

    /**
     * Store a newly created report.
     */
    public function store(ReportRequest $request)
    {
        $data = $request->validated();
        
        // Validation: If uploading FINAL, must have an APPROVED DRAFT
        if ($data['type'] === 'final') {
            $hasApprovedDraft = Report::where('internship_id', $data['internship_id'])
                ->where('type', 'draft')
                ->where('status', 'approved')
                ->exists();
            
            if (!$hasApprovedDraft) {
                return response()->json(['message' => 'Laporan Final hanya dapat diunggah setelah Laporan Draft disetujui oleh Dosen Pembimbing.'], 422);
            }
        }

        $report = $this->reportService->createReport(
            $data, 
            $request->file('file_url')
        );

        return response()->json([
            'message' => 'Laporan berhasil diunggah.',
            'data' => new ReportResource($report->load(['internship.company', 'internship.leader.user', 'internship.supervisor.user']))
        ], 201);
    }

    /**
     * Display the specified report.
     */
    public function show(Report $report)
    {
        $report->load(['internship.company', 'internship.supervisor.user', 'internship.leader.user']);
        return new ReportResource($report);
    }

    /**
     * Approve the report (Dosen)
     */
    public function approve(Report $report, Request $request)
    {
        // Ensure user is Dosen for the specific internship
        if ($request->user()->role === 'dosen') {
            if ($report->internship->supervisor_id !== ($request->user()->lecturer->id ?? null)) {
                return response()->json(['message' => 'Anda tidak memiliki akses untuk memvalidasi laporan ini.'], 403);
            }
        } elseif ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Anda tidak memiliki akses untuk memvalidasi laporan ini.'], 403);
        }

        $report->status = 'approved';
        $report->save();

        return response()->json([
            'message' => 'Laporan berhasil disetujui.',
            'data' => new ReportResource($report->load(['internship.company', 'internship.leader.user']))
        ]);
    }

    /**
     * Reject the report (Dosen)
     */
    public function reject(Report $report, Request $request)
    {
        // Ensure user is Dosen for the specific internship
        if ($request->user()->role === 'dosen') {
            if ($report->internship->supervisor_id !== ($request->user()->lecturer->id ?? null)) {
                return response()->json(['message' => 'Anda tidak memiliki akses untuk memvalidasi laporan ini.'], 403);
            }
        } elseif ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Anda tidak memiliki akses untuk memvalidasi laporan ini.'], 403);
        }

        $report->status = 'rejected';
        $report->save();

        return response()->json([
            'message' => 'Laporan berhasil ditolak.',
            'data' => new ReportResource($report->load(['internship.company', 'internship.leader.user']))
        ]);
    }

    /**
     * Remove the specified report.
     */
    public function destroy(Report $report, Request $request)
    {
        $this->reportService->deleteReport($report);
        return response()->json(['message' => 'Laporan berhasil dihapus.']);
    }
}
