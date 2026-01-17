<?php

namespace App\Http\Controllers;

use App\Models\EventReport;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class EventReportController extends Controller
{
    public function index(Request $request)
    {
        $query = EventReport::with(['user', 'approver']);

        // Logika Filter
        if ($request->filled('search')) {
            $query->where('event_name', 'like', '%' . $request->search . '%');
        }
        if ($request->filled('month') && $request->month !== 'Semua Bulan') {
            $query->whereMonth('event_date', $request->month);
        }
        if ($request->filled('year')) {
            $query->whereYear('event_date', $request->year);
        }
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Admin bisa lihat semua data (tidak filter by user)

        return Inertia::render('LaporanEvent', [
            'reports' => $query->latest()->get(),
            'filters' => $request->all()
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'event_date' => 'required|date',
            'event_name' => 'required|string|max:255',
            'description' => 'required|string',
            'drive_link' => 'nullable|url',
            'poster' => 'nullable|image|max:2048', // Maksimal 2MB (2048 KB)
            'report_file' => 'nullable|file|mimes:pdf|max:5120',
        ]);

        $posterPath = $request->hasFile('poster') ? $request->file('poster')->store('posters', 'public') : null;
        $reportPath = $request->hasFile('report_file') ? $request->file('report_file')->store('reports', 'public') : null;

        EventReport::create([
            'user_id' => auth()->id(),
            'event_date' => $validated['event_date'],
            'event_name' => $validated['event_name'],
            'description' => $validated['description'],
            'drive_link' => $validated['drive_link'],
            'poster_path' => $posterPath,
            'report_file_path' => $reportPath,
            'status' => 'pending',
        ]);

        return redirect()->back()->with('message', 'Laporan berhasil disimpan!');
    }

    public function updateStatus(Request $request, $id)
    {
        if (auth()->user()->role === 'admin') abort(403);
        
        $validated = $request->validate([
            'status' => 'required|in:approved,rejected,pending'
        ]);

        $report = EventReport::findOrFail($id);
        
        $updateData = [
            'status' => $validated['status'],
            'approved_by' => auth()->id(),
        ];

        // Set timestamp sesuai status
        if ($validated['status'] === 'approved') {
            $updateData['approved_at'] = now();
            $updateData['rejected_at'] = null;
            $message = 'Laporan berhasil disetujui!';
        } elseif ($validated['status'] === 'rejected') {
            $updateData['rejected_at'] = now();
            $updateData['approved_at'] = null;
            $message = 'Laporan ditolak.';
        } else {
            $updateData['approved_at'] = null;
            $updateData['rejected_at'] = null;
            $updateData['approved_by'] = null;
            $message = 'Status diperbarui ke pending.';
        }

        $report->update($updateData);
        
        return redirect()->back()->with('message', $message);
    }

    public function destroy($id)
    {
        $report = EventReport::findOrFail($id);
        if ($report->poster_path) Storage::disk('public')->delete($report->poster_path);
        if ($report->report_file_path) Storage::disk('public')->delete($report->report_file_path);
        $report->delete();
        return redirect()->back();
    }
}