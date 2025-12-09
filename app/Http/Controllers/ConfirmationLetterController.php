<?php

namespace App\Http\Controllers;

use App\Models\ConfirmationLetter;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;

class ConfirmationLetterController extends Controller
{
    // ... (Method index dan store tetap sama) ...
    public function index(Request $request)
    {
        $query = ConfirmationLetter::with('user');

        // FILTER ROLE: Jika Staff, hanya lihat punya sendiri
        if (auth()->user()->role === 'staff') {
            $query->where('user_id', auth()->id());
        }

        if ($request->filled('category') && $request->category !== 'Semua Kategori') {
            $query->where('category', $request->category);
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
            'letters' => $query->latest()->get(),
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
            'file' => 'required|file|mimes:pdf,jpg,jpeg,png,docx|max:5120',
        ]);

        $path = $request->file('file')->store('letters', 'public');

        ConfirmationLetter::create([
            'user_id' => auth()->id(),
            'event_date' => $validated['event_date'],
            'event_name' => $validated['event_name'],
            'eo_name' => $validated['eo_name'],
            'category' => $validated['category'],
            'file_path' => $path,
            'status' => 'pending',
        ]);

        return redirect()->back()->with('message', 'Arsip berhasil disimpan.');
    }

    // --- FITUR BARU: PREVIEW PDF ---
    public function preview(Request $request)
    {
        // Validasi sama persis dengan generate
        $data = $request->validate([
            'pihak_kedua_nama' => 'required|string',
            'pihak_kedua_jabatan' => 'required|string',
            'pihak_kedua_instansi' => 'required|string',
            'pihak_kedua_alamat' => 'required|string',
            'poin_support' => 'required|array|min:1',
            'poin_support.*' => 'required|string',
            'event_date' => 'required|date',
            'signatures' => 'required|array|min:1',
            'signatures.*.label' => 'required|string',
            'signatures.*.nama' => 'required|string',
            'signatures.*.jabatan' => 'required|string',
        ]);

        $data['pihak_pertama_nama'] = 'Listyo Rahayu';
        $data['pihak_pertama_jabatan'] = 'Marcomm Manager';

        // Render PDF tapi jangan disimpan, langsung stream ke browser
        $pdf = Pdf::loadView('pdf.confirmation_letter_template', compact('data'));
        
        return $pdf->stream('preview_surat.pdf');
    }

    public function generate(Request $request)
    {
        $data = $request->validate([
            'pihak_kedua_nama' => 'required|string',
            'pihak_kedua_jabatan' => 'required|string',
            'pihak_kedua_instansi' => 'required|string',
            'pihak_kedua_alamat' => 'required|string',
            'poin_support' => 'required|array|min:1',
            'poin_support.*' => 'required|string',
            'event_date' => 'required|date',
            'signatures' => 'required|array|min:1',
            'signatures.*.label' => 'required|string',
            'signatures.*.nama' => 'required|string',
            'signatures.*.jabatan' => 'required|string',
        ]);

        $data['pihak_pertama_nama'] = 'Listyo Rahayu';
        $data['pihak_pertama_jabatan'] = 'Marcomm Manager';
        
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
        $letter->update(['status' => $request->status]);
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
            'file' => 'nullable|file|mimes:pdf,jpg,jpeg,png,docx|max:5120', // Nullable saat edit
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
            // Reset status ke pending setelah edit agar diperiksa ulang manager
            'status' => 'pending', 
        ]);

        return redirect()->back()->with('message', 'Surat berhasil diperbarui dan menunggu persetujuan ulang.');
    }
}