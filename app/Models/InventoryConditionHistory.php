<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InventoryConditionHistory extends Model
{
    use HasFactory;

    protected $fillable = [
        'inventory_id',
        'condition',
        'condition_notes',
        'changed_by',
    ];

    public function inventory()
    {
        return $this->belongsTo(Inventory::class);
    }

    public function changedBy()
    {
        return $this->belongsTo(User::class, 'changed_by');
    }
}
