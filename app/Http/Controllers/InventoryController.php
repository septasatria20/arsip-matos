<?php

namespace App\Http\Controllers;

use App\Models\Inventory;
use App\Models\InventoryConditionHistory;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class InventoryController extends Controller
{
    public function index(Request $request)
    {
        $query = Inventory::with(['conditionHistories.changedBy']);

        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        if ($request->filled('condition')) {
            $query->where('condition', $request->condition);
        }

        return Inertia::render('InventarisMarcom', [
            'items' => $query->latest()->get(),
            'filters' => $request->only(['search', 'condition']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category' => 'required|string',
            'quantity' => 'required|integer',
            'location' => 'required|string',
            'condition' => 'required|in:good,repair,damaged',
            'description' => 'nullable|string',
            'image' => 'nullable|image|max:5120',
            'drive_link' => 'nullable|url',
            'drive_link_folder' => 'nullable|url',
        ]);

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('inventories', 'public');
        }

        $inventory = Inventory::create([
            'name' => $validated['name'],
            'category' => $validated['category'],
            'quantity' => $validated['quantity'],
            'location' => $validated['location'],
            'condition' => $validated['condition'],
            'condition_changed_at' => now(),
            'description' => $validated['description'] ?? null,
            'image_path' => $imagePath,
            'drive_link' => $validated['drive_link'] ?? null,
            'drive_link_folder' => $validated['drive_link_folder'],
        ]);

        // Buat history pertama kali
        InventoryConditionHistory::create([
            'inventory_id' => $inventory->id,
            'condition' => $validated['condition'],
            'condition_notes' => 'Kondisi awal saat barang ditambahkan',
            'changed_by' => auth()->id(),
        ]);

        return redirect()->back()->with('message', 'Barang berhasil ditambahkan!');
    }

    // Method baru untuk Update (Edit Kondisi & Keterangan)
    public function update(Request $request, $id)
    {
        $item = Inventory::findOrFail($id);
        
        $validated = $request->validate([
            'quantity' => 'required|integer|min:0',
            'location' => 'required|string|max:255',
            'condition' => 'required|in:good,repair,damaged',
            'condition_notes' => 'nullable|string',
            'description' => 'nullable|string',
            'image' => 'nullable|image|max:5120',
        ]);

        $data = [
            'quantity' => $validated['quantity'],
            'location' => $validated['location'],
            'description' => $validated['description'],
        ];

        // Jika kondisi berubah, simpan ke history
        if ($item->condition !== $validated['condition']) {
            $data['condition'] = $validated['condition'];
            $data['condition_changed_at'] = now();
            $data['condition_notes'] = $validated['condition_notes'] ?? null;
            
            // Simpan ke history
            InventoryConditionHistory::create([
                'inventory_id' => $item->id,
                'condition' => $validated['condition'],
                'condition_notes' => $validated['condition_notes'],
                'changed_by' => auth()->id(),
            ]);
        } else if ($request->filled('condition_notes')) {
            // Jika kondisi sama tapi ada catatan baru, update catatan saja
            $data['condition_notes'] = $validated['condition_notes'];
        }

        // Handle Image Upload
        if ($request->hasFile('image')) {
            if ($item->image_path) {
                Storage::disk('public')->delete($item->image_path);
            }
            $data['image_path'] = $request->file('image')->store('inventories', 'public');
        }

        $item->update($data);

        return redirect()->back()->with('message', 'Data barang diperbarui.');
    }

    public function destroy($id)
    {
        $item = Inventory::findOrFail($id);
        if ($item->image_path) Storage::disk('public')->delete($item->image_path);
        $item->delete();
        return redirect()->back()->with('message', 'Barang dihapus.');
    }
}