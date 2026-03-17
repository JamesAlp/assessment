<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MetricsController extends Controller
{
    public function monthlySales(): JsonResponse
    {
        return response()->json([
            'label' => 'Monthly Sales',
            'value' => 125000, // Example static value; replace with real query as needed
        ]);
    }

    public function openDeals(): JsonResponse
    {
        return response()->json([
            'label' => 'Open Deals',
            'value' => 42, // Example static value
        ]);
    }

    public function activeAccounts(): JsonResponse
    {
        return response()->json([
            'label' => 'Active Accounts',
            'value' => 318, // Example static value
        ]);
    }

    public function dailySales(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'start_date' => ['nullable', 'date_format:Y-m-d', 'before_or_equal:end_date'],
            'end_date' => ['nullable', 'date_format:Y-m-d', 'after_or_equal:start_date'],
        ]);

        $end = isset($validated['end_date'])
            ? now()->parse($validated['end_date'])
            : now();

        $start = isset($validated['start_date'])
            ? now()->parse($validated['start_date'])
            : $end->copy()->subDays(29);

        $data = [];
        for ($d = $start->copy(); $d->lte($end); $d->addDay()) {
            $data[$d->toDateString()] = rand(4000, 15000);
        }

        return response()->json([
            'label' => 'Daily Sales',
            'values' => $data,
        ]);

    }
}
