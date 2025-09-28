<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Conversation extends Model
{
    use HasFactory;

    protected $fillable = [
        'host_id',
        'renter_id',
    ];

    public function host(): BelongsTo
    {
        return $this->belongsTo(User::class, 'host_id');
    }

    public function renter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'renter_id');
    }

    public function messages(): HasMany
    {
        return $this->hasMany(Message::class);
    }

    public function lastMessage(): HasMany
    {
        return $this->hasMany(Message::class)->latest();
    }

    /**
     * Check if a user is a participant in this conversation.
     */
    public function isParticipant(int $userId): bool
    {
        return $this->host_id === $userId || $this->renter_id === $userId;
    }

    /**
     * Mark all messages as read for a specific user.
     */
    public function markAsReadForUser(int $userId): void
    {
        $this->messages()
            ->where('sender_id', '!=', $userId)
            ->where('read_status', false)
            ->update(['read_status' => true]);
    }
}