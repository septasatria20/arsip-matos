<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\ConfirmationLetter;
use App\Models\EventReport;
use App\Models\Inventory;
use Illuminate\Support\Facades\Log;

class SearchController extends Controller
{
    public function search(Request $request)
    {
        try {
            $query = $request->input('q', '');
            
            if (strlen($query) < 2) {
                return response()->json([
                    'letters' => [],
                    'events' => [],
                    'inventories' => []
                ]);
            }

            $user = auth()->user();
            $role = $user->role;

            // Search Confirmation Letters
            $lettersQuery = ConfirmationLetter::query();
            if ($role === 'staff') {
                $lettersQuery->where('user_id', $user->id);
            }
            $letters = $lettersQuery
                ->where(function($q) use ($query) {
                    $q->where('event_name', 'like', "%{$query}%")
                      ->orWhere('eo_name', 'like', "%{$query}%")
                      ->orWhere('category', 'like', "%{$query}%");
                })
                ->limit(5)
                ->get()
                ->map(function($item) {
                    return [
                        'id' => $item->id,
                        'title' => $item->event_name,
                        'subtitle' => $item->eo_name ?? 'No EO',
                        'status' => $item->status,
                        'type' => 'letter',
                        'url' => route('confirmation.index')
                    ];
                });

            // Search Event Reports
            $eventsQuery = EventReport::query();
            if ($role === 'staff') {
                $eventsQuery->where('user_id', $user->id);
            }
            $events = $eventsQuery
                ->where(function($q) use ($query) {
                    $q->where('event_name', 'like', "%{$query}%")
                      ->orWhere('location', 'like', "%{$query}%");
                })
                ->limit(5)
                ->get()
                ->map(function($item) {
                    return [
                        'id' => $item->id,
                        'title' => $item->event_name,
                        'subtitle' => $item->location ?? 'Lokasi',
                        'status' => $item->status,
                        'type' => 'event',
                        'url' => route('laporan.index')
                    ];
                });

            // Search Inventories (only for manager/admin)
            $inventories = collect([]);
            if ($role === 'manager' || $role === 'co_manager') {
                $inventories = Inventory::query()
                    ->where(function($q) use ($query) {
                        $q->where('name', 'like', "%{$query}%")
                          ->orWhere('code', 'like', "%{$query}%")
                          ->orWhere('category', 'like', "%{$query}%");
                    })
                    ->limit(5)
                    ->get()
                    ->map(function($item) {
                        return [
                            'id' => $item->id,
                            'title' => $item->name,
                            'subtitle' => $item->code ?? 'Kode',
                            'status' => $item->condition,
                            'type' => 'inventory',
                            'url' => route('inventories.index')
                        ];
                    });
            }

            return response()->json([
                'letters' => $letters,
                'events' => $events,
                'inventories' => $inventories
            ]);
        } catch (\Exception $e) {
            Log::error('Search Error: ' . $e->getMessage());
            return response()->json([
                'error' => $e->getMessage(),
                'letters' => [],
                'events' => [],
                'inventories' => []
            ], 200);
        }
    }
}
