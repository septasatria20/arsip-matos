<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OldBudgetFile extends Model
{
    use HasFactory;

    protected $fillable = [
        'year',
        'file_name',
        'file_path',
        'description',
    ];
}
