<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    use HasFactory;

    protected $fillable = ['slug', 'name', 'name_km', 'icon', 'color', 'description', 'is_enabled'];

    protected $casts = [
        'is_enabled' => 'boolean'
    ];

    public function questions()
    {
        return $this->hasMany(Question::class);
    }
}
