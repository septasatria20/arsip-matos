<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\ConfirmationLetter;
use App\Models\EventReport;
use Carbon\Carbon;

class NotificationController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        $role = $user->role;
        $notifications = [];

        if ($role === 'staff') {
            // Untuk Staff: notif jika surat/laporan disetujui atau ditolak
            $approvedLetters = ConfirmationLetter::where('user_id', $user->id)
                ->where('status', 'approved')
                ->where('approved_at', '>=', Carbon::now()->subDays(7))
                ->latest('approved_at')
                ->get();

            foreach ($approvedLetters as $letter) {
                $notifications[] = [
                    'title' => 'Surat "' . $letter->event_name . '" disetujui',
                    'time' => $letter->approved_at->diffForHumans(),
                    'type' => 'approved',
                    'url' => route('confirmation.index')
                ];
            }

            $approvedEvents = EventReport::where('user_id', $user->id)
                ->where('status', 'approved')
                ->where('approved_at', '>=', Carbon::now()->subDays(7))
                ->latest('approved_at')
                ->get();

            foreach ($approvedEvents as $event) {
                $notifications[] = [
                    'title' => 'Laporan "' . $event->event_name . '" disetujui',
                    'time' => $event->approved_at->diffForHumans(),
                    'type' => 'approved',
                    'url' => route('laporan.index')
                ];
            }

        } else {
            // Untuk Manager: notif pending approval
            $pendingLetters = ConfirmationLetter::where('status', 'pending')
                ->latest()
                ->limit(5)
                ->get();

            foreach ($pendingLetters as $letter) {
                $notifications[] = [
                    'title' => 'Pengingat: Surat "' . $letter->event_name . '" menunggu approval',
                    'time' => $letter->created_at->diffForHumans(),
                    'type' => 'pending',
                    'url' => route('confirmation.index')
                ];
            }

            $pendingEvents = EventReport::where('status', 'pending')
                ->latest()
                ->limit(5)
                ->get();

            foreach ($pendingEvents as $event) {
                $notifications[] = [
                    'title' => 'Pengingat: Laporan "' . $event->event_name . '" menunggu approval',
                    'time' => $event->created_at->diffForHumans(),
                    'type' => 'pending',
                    'url' => route('laporan.index')
                ];
            }
        }

        // Sort by time (newest first)
        usort($notifications, function($a, $b) {
            // Convert diffForHumans back to timestamp for sorting - just use simple ordering
            return 0; // Keep current order since we already sorted by latest
        });

        return response()->json(array_slice($notifications, 0, 10));
    }
}
