<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Budget extends Model
{
    use HasFactory;

    // Field yang boleh diisi (Mass Assignment)
    protected $fillable = [
        'year',
        'month',
        'amount',
    ];
}