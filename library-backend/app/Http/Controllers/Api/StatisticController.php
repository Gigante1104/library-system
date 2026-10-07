<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\StatisticService;

class StatisticController extends Controller
{
    public function __construct(private StatisticService $statisticService)
    {
    }

    public function index()
    {
        return response()->json($this->statisticService->getDashboard(), 200);
    }
}
