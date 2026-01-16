<?php

namespace App\Http\Controllers;

use App\Models\ConfirmationLetter;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;

class ConfirmationLetterController extends Controller
{
    // ... (Method index dan store tetap sama) ...
    public function index(Request $request)
    {
        $query = ConfirmationLetter::with('user');

        // FILTER ROLE: Jika Admin, hanya lihat punya sendiri
        if (auth()->user()->role === 'admin') {
            $query->where('user_id', auth()->id());
        }

        if ($request->filled('category') && $request->category !== 'Semua Kategori') {
            $query->where('category', $request->category);
        }

        // FILTER STATUS
        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->filled('month') && $request->month !== 'Semua Bulan') {
            $query->whereMonth('event_date', $request->month);
        }

        if ($request->filled('year')) {
            $query->whereYear('event_date', $request->year);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('event_name', 'like', "%{$search}%")
                  ->orWhere('eo_name', 'like', "%{$search}%");
            });
        }

        return Inertia::render('ConfirmationLetter', [
            'letters' => $query->orderBy('created_at', 'desc')->get(),
            'filters' => $request->all(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'event_date' => 'required|date',
            'event_name' => 'required|string|max:255',
            'eo_name' => 'required|string|max:255',
            'category' => 'required|string',
            'file' => 'nullable|file|mimes:pdf,jpg,jpeg,png,docx|max:5120',
            'drive_link' => 'nullable|url',
        ]);

        $path = null;
        if ($request->hasFile('file')) {
            $path = $request->file('file')->store('letters', 'public');
        }

        ConfirmationLetter::create([
            'user_id' => auth()->id(),
            'event_date' => $validated['event_date'],
            'event_name' => $validated['event_name'],
            'eo_name' => $validated['eo_name'],
            'category' => $validated['category'],
            'file_path' => $path,
            'drive_link' => $validated['drive_link'] ?? null,
            'status' => 'pending',
        ]);

        return redirect()->back()->with('message', 'Arsip berhasil disimpan.');
    }

    // --- FITUR BARU: PREVIEW PDF ---
    public function preview(Request $request)
    {
        try {
            // Validasi sama persis dengan generate
            $data = $request->validate([
                'pihak_kedua_nama' => 'required|string',
                'pihak_kedua_jabatan' => 'required|string',
                'pihak_kedua_instansi' => 'required|string',
                'pihak_kedua_alamat' => 'required|string',
                'tema_event' => 'required|string',
                'tanggal_surat' => 'required|date',
                'event_date' => 'required|date',
                'poin_support_pihak_pertama' => 'required|array|min:1',
                'poin_support_pihak_pertama.*' => 'required|string',
                'poin_support_pihak_kedua' => 'required|array|min:1',
                'poin_support_pihak_kedua.*' => 'required|string',
                'signatures' => 'required|array|min:1',
                'signatures.*.label' => 'required|string',
                'signatures.*.nama' => 'required|string',
                'signatures.*.jabatan' => 'required|string',
            ]);

            $data['pihak_pertama_nama'] = auth()->user()->name;
            $data['pihak_pertama_jabatan'] = auth()->user()->role === 'manager' ? 'Manager' : (auth()->user()->role === 'co_manager' ? 'Co-Manager' : 'Staff');

            // Render PDF tapi jangan disimpan, langsung stream ke browser
            $pdf = Pdf::loadView('pdf.confirmation_letter_template', compact('data'));
            
            return $pdf->stream('preview_surat.pdf');
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Data tidak lengkap',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Preview PDF Error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Terjadi kesalahan: ' . $e->getMessage()
            ], 500);
        }
    }

    public function generate(Request $request)
    {
        $data = $request->validate([
            'pihak_kedua_nama' => 'required|string',
            'pihak_kedua_jabatan' => 'required|string',
            'pihak_kedua_instansi' => 'required|string',
            'pihak_kedua_alamat' => 'required|string',
            'tema_event' => 'required|string',
            'tanggal_surat' => 'required|date',
            'event_date' => 'required|date',
            'poin_support_pihak_pertama' => 'required|array|min:1',
            'poin_support_pihak_pertama.*' => 'required|string',
            'poin_support_pihak_kedua' => 'required|array|min:1',
            'poin_support_pihak_kedua.*' => 'required|string',
            'signatures' => 'required|array|min:1',
            'signatures.*.label' => 'required|string',
            'signatures.*.nama' => 'required|string',
            'signatures.*.jabatan' => 'required|string',
        ]);

        $data['pihak_pertama_nama'] = auth()->user()->name;
        $data['pihak_pertama_jabatan'] = auth()->user()->role === 'manager' ? 'Manager' : (auth()->user()->role === 'co_manager' ? 'Co-Manager' : 'Staff');
        
        $fileName = 'CL_' . time() . '_' . str_replace(' ', '_', $data['pihak_kedua_instansi']) . '.pdf';
        $filePath = 'letters/' . $fileName;

        $pdf = Pdf::loadView('pdf.confirmation_letter_template', compact('data'));
        
        Storage::disk('public')->put($filePath, $pdf->output());

        ConfirmationLetter::create([
            'user_id' => auth()->id(),
            'event_date' => now(),
            'event_name' => 'Kerjasama ' . $data['pihak_kedua_instansi'],
            'eo_name' => $data['pihak_kedua_instansi'],
            'category' => 'Sponsorship', 
            'file_path' => $filePath,
            'status' => 'approved', 
            'description' => 'Digenerate otomatis oleh sistem dengan ' . count($data['signatures']) . ' penandatangan.',
        ]);

        return redirect()->back()->with('message', 'Surat berhasil dibuat & disimpan!');
    }

    public function updateStatus(Request $request, $id)
    {
        if (auth()->user()->role === 'staff') abort(403);
        $letter = ConfirmationLetter::findOrFail($id);
        
        $updateData = ['status' => $request->status];
        
        if ($request->status === 'approved') {
            $updateData['approved_at'] = now();
            $updateData['rejected_at'] = null;
        } elseif ($request->status === 'rejected') {
            $updateData['rejected_at'] = now();
            $updateData['approved_at'] = null;
        }
        
        $letter->update($updateData);
        return redirect()->back()->with('message', 'Status diperbarui.');
    }

    public function destroy($id)
    {
        $letter = ConfirmationLetter::findOrFail($id);
        if ($letter->file_path) Storage::disk('public')->delete($letter->file_path);
        $letter->delete();
        return redirect()->back()->with('message', 'Data dihapus.');
    }

    public function update(Request $request, $id)
    {
        $letter = ConfirmationLetter::findOrFail($id);

        // Validasi Kepemilikan (Staff tidak boleh edit punya orang lain)
        if (auth()->user()->role === 'staff' && $letter->user_id !== auth()->id()) {
            abort(403);
        }

        // Validasi Status (Hanya boleh edit jika Pending atau Rejected)
        if ($letter->status === 'approved' && auth()->user()->role === 'staff') {
            return redirect()->back()->with('error', 'Surat yang sudah disetujui tidak dapat diedit.');
        }

        $validated = $request->validate([
            'event_date' => 'required|date',
            'event_name' => 'required|string|max:255',
            'eo_name' => 'required|string|max:255',
            'category' => 'required|string',
            'file' => 'nullable|file|mimes:pdf,jpg,jpeg,png,docx|max:5120',
            'drive_link' => 'nullable|url',
        ]);

        // Update File jika ada upload baru
        if ($request->hasFile('file')) {
            if ($letter->file_path) Storage::disk('public')->delete($letter->file_path);
            $path = $request->file('file')->store('letters', 'public');
            $letter->file_path = $path;
        }

        $letter->update([
            'event_date' => $validated['event_date'],
            'event_name' => $validated['event_name'],
            'eo_name' => $validated['eo_name'],
            'category' => $validated['category'],
            'drive_link' => $validated['drive_link'] ?? $letter->drive_link,
            'status' => 'pending',
            'approved_at' => null,
            'rejected_at' => null,
        ]);

        return redirect()->back()->with('message', 'Surat berhasil diperbarui dan menunggu persetujuan ulang.');
    }
}