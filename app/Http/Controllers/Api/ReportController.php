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

        $request->validate([
            'feedback' => ['required', 'string', 'min:5', 'max:1000'],
        ]);

        $report->status = 'rejected';
        $report->feedback = $request->input('feedback');
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
