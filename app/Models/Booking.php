<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Carbon\Carbon;

class Booking extends Model
{
    use HasFactory;

    protected $fillable = [
        'listing_id',
        'user_id',
        'host_id',
        'start_date',
        'end_date',
        'guests',
        'total_price',
        'status'
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'total_price' => 'decimal:2',
        'guests' => 'integer',
    ];

    protected $dates = [
        'start_date',
        'end_date',
        'created_at',
        'updated_at'
    ];

    /**
     * Get the listing that this booking belongs to
     */
    public function listing(): BelongsTo
    {
        return $this->belongsTo(Listing::class);
    }

    /**
     * Get the user (renter) who made this booking
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the host (owner) of the listing
     */
    public function host(): BelongsTo
    {
        return $this->belongsTo(User::class, 'host_id');
    }

    /**
     * Alias for user relationship (for clarity)
     */
    public function renter(): BelongsTo
    {
        return $this->user();
    }

    /**
     * Scope to filter bookings by status
     */
    public function scopeWithStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope to filter bookings by host
     */
    public function scopeForHost($query, $hostId)
    {
        return $query->where('host_id', $hostId);
    }

    /**
     * Scope to filter bookings by renter
     */
    public function scopeForRenter($query, $renterId)
    {
        return $query->where('user_id', $renterId);
    }

    /**
     * Scope to filter active bookings (pending or confirmed)
     */
    public function scopeActive($query)
    {
        return $query->whereIn('status', ['pending', 'confirmed']);
    }

    /**
     * Check if booking dates overlap with given dates
     * Uses proper overlap logic: two date ranges overlap if start1 < end2 and start2 < end1
     */
    public function scopeOverlapping($query, $startDate, $endDate)
    {
        return $query->where('start_date', '<', $endDate)
                    ->where('end_date', '>', $startDate);
    }

    /**
     * Get bookings that conflict with the given date range
     */
    public function scopeConflictsWith($query, $startDate, $endDate, $excludeStatuses = ['cancelled', 'declined'])
    {
        return $query->whereNotIn('status', $excludeStatuses)
                    ->where('start_date', '<', $endDate)
                    ->where('end_date', '>', $startDate);
    }

    /**
     * Get the duration of the booking in days
     */
    public function getDurationAttribute()
    {
        return $this->start_date->diffInDays($this->end_date);
    }

    /**
     * Get the duration in days (alternative method)
     */
    public function getDurationInDays()
    {
        return $this->start_date->diffInDays($this->end_date);
    }

    /**
     * Check if the booking can be cancelled
     */
    public function canBeCancelled()
    {
        return $this->status === 'pending';
    }

    /**
     * Check if the booking can be confirmed
     */
    public function canBeConfirmed()
    {
        return $this->status === 'pending';
    }

    /**
     * Check if the booking can be declined
     */
    public function canBeDeclined()
    {
        return $this->status === 'pending';
    }

    /**
     * Check if the booking is active (confirmed and within date range)
     */
    public function isActive()
    {
        return $this->status === 'confirmed' && 
               $this->start_date <= now() && 
               $this->end_date >= now();
    }

    /**
     * Check if the booking is upcoming
     */
    public function isUpcoming()
    {
        return $this->status === 'confirmed' && $this->start_date > now();
    }

    /**
     * Check if the booking is completed
     */
    public function isCompleted()
    {
        return $this->status === 'confirmed' && $this->end_date < now();
    }

    /**
     * Check if the booking is pending
     */
    public function isPending()
    {
        return $this->status === 'pending';
    }

    /**
     * Check if the booking is confirmed
     */
    public function isConfirmed()
    {
        return $this->status === 'confirmed';
    }

    /**
     * Check if the booking is cancelled
     */
    public function isCancelled()
    {
        return $this->status === 'cancelled';
    }

    /**
     * Check if the booking is declined
     */
    public function isDeclined()
    {
        return $this->status === 'declined';
    }

    /**
     * Get formatted start date
     */
    public function getFormattedStartDateAttribute()
    {
        return $this->start_date->format('M j, Y');
    }

    /**
     * Get formatted end date
     */
    public function getFormattedEndDateAttribute()
    {
        return $this->end_date->format('M j, Y');
    }

    /**
     * Get formatted date range
     */
    public function getDateRangeAttribute()
    {
        return $this->start_date->format('M j') . ' - ' . $this->end_date->format('M j, Y');
    }

    /**
     * Get status badge color
     */
    public function getStatusColorAttribute()
    {
        return match($this->status) {
            'pending' => 'yellow',
            'confirmed' => 'green',
            'cancelled' => 'red',
            'declined' => 'red',
            'completed' => 'blue',
            default => 'gray'
        };
    }

    /**
     * Get formatted total price
     */
    public function getFormattedTotalPriceAttribute()
    {
        return number_format($this->total_price, 2);
    }

    /**
     * Static method to check if dates are available for a listing
     */
    public static function areDatesAvailable($listingId, $startDate, $endDate, $excludeBookingId = null)
    {
        $query = static::where('listing_id', $listingId)
                      ->active()
                      ->conflictsWith($startDate, $endDate);

        if ($excludeBookingId) {
            $query->where('id', '!=', $excludeBookingId);
        }

        return !$query->exists();
    }

    /**
     * Get conflicting bookings for given dates
     */
    public static function getConflictingBookings($listingId, $startDate, $endDate, $excludeBookingId = null)
    {
        $query = static::where('listing_id', $listingId)
                      ->active()
                      ->conflictsWith($startDate, $endDate);

        if ($excludeBookingId) {
            $query->where('id', '!=', $excludeBookingId);
        }

        return $query->get();
    }
}