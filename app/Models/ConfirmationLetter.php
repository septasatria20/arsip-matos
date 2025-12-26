<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ConfirmationLetter extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'event_date', 'event_name', 'eo_name', 
        'category', 'description', 'file_path', 'drive_link', 
        'status', 'approved_at', 'rejected_at',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}