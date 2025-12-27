<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Inventory extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'category',
        'quantity',
        'location',
        'condition',
        'condition_notes',
        'condition_changed_at',
        'description',
        'image_path',
        'drive_link',
        'drive_link_folder',
    ];

    protected $casts = [
        'condition_changed_at' => 'datetime',
    ];

    public function conditionHistories()
    {
        return $this->hasMany(InventoryConditionHistory::class)->orderBy('created_at', 'desc');
    }
}