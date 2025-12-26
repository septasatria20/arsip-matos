<?php

namespace App\Http\Controllers;

use App\Models\Inventory;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class InventoryController extends Controller
{
    public function index(Request $request)
    {
        $query = Inventory::query();

        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        return Inertia::render('InventarisMarcom', [
            'items' => $query->latest()->get(),
            'filters' => $request->only(['search']),
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
            'description' => 'nullable|string', // Tambahkan validasi description
            'image' => 'nullable|image|max:5120', // 5MB
            'drive_link_folder' => 'nullable|url',
        ]);

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('inventories', 'public');
        }

        Inventory::create([
            'name' => $validated['name'],
            'category' => $validated['category'],
            'quantity' => $validated['quantity'],
            'location' => $validated['location'],
            'condition' => $validated['condition'],
            'description' => $validated['description'] ?? null, // Simpan description
            'image_path' => $imagePath,
            'drive_link_folder' => $validated['drive_link_folder'],
        ]);

        return redirect()->back()->with('message', 'Barang berhasil ditambahkan!');
    }

    // Method baru untuk Update (Edit Kondisi & Keterangan)
    public function update(Request $request, $id)
    {
        $item = Inventory::findOrFail($id);
        
        $validated = $request->validate([
            'condition' => 'required|in:good,repair,damaged',
            'description' => 'nullable|string',
            'image' => 'nullable|image|max:5120', // Validasi gambar
        ]);

        $data = [
            'condition' => $validated['condition'],
            'description' => $validated['description'],
        ];

        // Handle Image Upload
        if ($request->hasFile('image')) {
            // Hapus gambar lama jika ada
            if ($item->image_path) {
                Storage::disk('public')->delete($item->image_path);
            }
            // Upload gambar baru
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