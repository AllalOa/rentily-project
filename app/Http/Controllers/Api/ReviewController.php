<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Review;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function index(Request $request)
    {
        $query = Review::with('listing', 'renter')
            ->when($request->listing_id, fn($q, $v) => $q->where('listing_id', $v))
            ->when($request->user_id, fn($q, $v) => $q->where('user_id', $v));
        return response()->json($query->latest()->paginate(12));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'listing_id' => 'required|exists:listings,id',
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string',
        ]);
        $data['user_id'] = auth()->id();
        $review = Review::create($data);
        return response()->json($review->load('listing', 'renter'), 201);
    }

    public function show(Review $review)
    {
        return response()->json($review->load('listing', 'renter'));
    }

    public function update(Request $request, Review $review)
    {
        $data = $request->validate([
            'rating' => 'sometimes|integer|min:1|max:5',
            'comment' => 'sometimes|nullable|string',
        ]);
        $review->update($data);
        return response()->json($review->fresh()->load('listing', 'renter'));
    }

    public function destroy(Review $review)
    {
        $review->delete();
        return response()->json(['deleted' => true]);
    }
}


