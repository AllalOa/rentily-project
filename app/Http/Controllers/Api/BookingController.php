<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Listing;
use Illuminate\Http\Request;

class BookingController extends Controller
{
    public function index(Request $request)
    {
        $query = Booking::with('listing', 'renter');

        if ($request->type === 'host') {
            $query->whereHas('listing', fn($q) => $q->where('user_id', auth()->id()));
        } else {
            $query->where('user_id', auth()->id());
        }

        return response()->json($query->latest()->paginate(12));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'listing_id' => 'required|exists:listings,id',
            'start_date' => 'required|date|after_or_equal:today',
            'end_date' => 'required|date|after:start_date',
            'guests' => 'required|integer|min:1',
        ]);

        $listing = Listing::findOrFail($data['listing_id']);

        $days = (new \Carbon\Carbon($data['start_date']))->diffInDays(new \Carbon\Carbon($data['end_date']));
        $total = max(1, $days) * $listing->price_per_day;

        $booking = Booking::create([
            ...$data,
            'user_id' => auth()->id(),
            'total_price' => $total,
            'status' => 'pending',
        ]);

        return response()->json($booking->load('listing', 'renter'), 201);
    }

    public function show(Booking $booking)
    {
        return response()->json($booking->load('listing', 'renter'));
    }

    public function update(Request $request, Booking $booking)
    {
        $data = $request->validate([
            'status' => 'in:pending,confirmed,cancelled',
        ]);
        $booking->update($data);
        return response()->json($booking->fresh()->load('listing', 'renter'));
    }

    public function confirm(Booking $booking)
    {
        $booking->update(['status' => 'confirmed']);
        return response()->json($booking);
    }

    public function cancel(Booking $booking)
    {
        $booking->update(['status' => 'cancelled']);
        return response()->json($booking);
    }
}


