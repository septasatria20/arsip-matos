<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EventReport extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'event_date', 'event_name', 'description', // Description masuk
        'poster_path', 'report_file_path', 'drive_link', 'status'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}