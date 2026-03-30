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
        // Only student should be able to store, handled by UI, but lets ensure validity
        $report = $this->reportService->createReport(
            $request->validated(), 
            $request->file('file_url')
        );

        return response()->json([
            'message' => 'Laporan mingguan berhasil diunggah.',
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
     * Remove the specified report.
     */
    public function destroy(Report $report, Request $request)
    {
        // Ideally enforce that only the uploader or admin can delete
        $this->reportService->deleteReport($report);
        return response()->json(['message' => 'Laporan berhasil dihapus.']);
    }
}
