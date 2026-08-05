<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ReportRequest;
use App\Http\Resources\ReportResource;
use App\Models\Report;
use App\Services\ReportService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ReportController extends Controller
{
    protected $reportService;

    public function __construct(ReportService $reportService)
    {
        $this->reportService = $reportService;
    }

    /**
     * Display a listing of the reports.
     * Authorization handled by ReportPolicy::viewAny.
     */
    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Report::class);

        $reports = $this->reportService->getAllReports();

        return ReportResource::collection($reports);
    }

    /**
     * Store a newly created report.
     * Authorization handled by ReportPolicy::create.
     */
    public function store(ReportRequest $request): JsonResponse
    {
        $this->authorize('create', Report::class);

        $report = $this->reportService->createReport(
            $request->validated(),
            $request->file('file_url')
        );

        return response()->json([
            'message' => 'Laporan berhasil diunggah.',
            'data' => new ReportResource($report->load(['internship.company', 'internship.leader.user', 'internship.supervisor.user'])),
        ], 201);
    }

    /**
     * Display the specified report.
     * Authorization handled by ReportPolicy::view.
     */
    public function show(Report $report): JsonResponse
    {
        $this->authorize('view', $report);

        $report->load(['internship.company', 'internship.supervisor.user', 'internship.leader.user']);

        return new ReportResource($report);
    }

    /**
     * Approve the report.
     * Authorization handled by ReportPolicy::approve.
     */
    public function approve(Report $report, Request $request): JsonResponse
    {
        $this->authorize('approve', $report);

        $report->status = 'approved';
        $report->save();

        return response()->json([
            'message' => 'Laporan berhasil disetujui.',
            'data' => new ReportResource($report->load(['internship.company', 'internship.leader.user'])),
        ]);
    }

    /**
     * Reject the report.
     * Authorization handled by ReportPolicy::reject.
     */
    public function reject(Report $report, Request $request): JsonResponse
    {
        $this->authorize('reject', $report);

        $request->validate([
            'feedback' => ['required', 'string', 'min:5', 'max:1000'],
        ]);

        $report->status = 'rejected';
        $report->feedback = $request->input('feedback');
        $report->save();

        return response()->json([
            'message' => 'Laporan berhasil ditolak.',
            'data' => new ReportResource($report->load(['internship.company', 'internship.leader.user'])),
        ]);
    }

    /**
     * Remove the specified report.
     * Authorization handled by ReportPolicy::delete.
     */
    public function destroy(Report $report): JsonResponse
    {
        $this->authorize('delete', $report);

        $this->reportService->deleteReport($report);

        return response()->json(['message' => 'Laporan berhasil dihapus.']);
    }
}
