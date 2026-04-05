<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ActivityResource;
use App\Services\ActivityService;
use Illuminate\Http\Request;

class ActivityController extends Controller
{
    protected $activityService;

    public function __construct(ActivityService $activityService)
    {
        $this->activityService = $activityService;
    }

    public function index(Request $request)
    {
        $activities = $this->activityService->getAll($request->user());
        return ActivityResource::collection($activities);
    }

    public function latest(Request $request)
    {
        $activities = $this->activityService->getLatest($request->user(), 5);
        return ActivityResource::collection($activities);
    }
}
