<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('bookings', function (Blueprint $table) {
            // Option 1: If using ENUM, update it to include 'declined'
            $table->enum('status', ['pending', 'confirmed', 'declined', 'cancelled', 'completed'])
                  ->default('pending')
                  ->change();
            
            // Option 2: If switching to VARCHAR
            // $table->string('status', 20)->default('pending')->change();
        });
    }

    public function down()
    {
        Schema::table('bookings', function (Blueprint $table) {
            // Revert to previous enum values
            $table->enum('status', ['pending', 'confirmed', 'cancelled', 'completed'])
                  ->default('pending')
                  ->change();
        });
    }
};