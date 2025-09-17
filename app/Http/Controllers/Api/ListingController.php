<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Listing;
use Illuminate\Http\Request;

class ListingController extends Controller
{
    public function index(Request $request)
    {
        $query = Listing::with('images', 'host')
            ->when($request->type, fn($q, $v) => $q->where('type', $v))
            ->when($request->location, fn($q, $v) => $q->where('location', 'like', "%$v%"))
            ->when($request->status, fn($q, $v) => $q->where('status', $v));

        if ($request->has('price')) {
            $min = data_get($request->price, 'min');
            $max = data_get($request->price, 'max');
            $query->when($min, fn($q) => $q->where('price_per_day', '>=', $min))
                  ->when($max, fn($q) => $q->where('price_per_day', '<=', $max));
        }

        $listings = $query->paginate(12);
        return response()->json($listings);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|in:car,home',
            'price_per_day' => 'required|integer|min:0',
            'location' => 'required|string|max:255',
            'status' => 'in:active,paused',
        ]);

        $data['user_id'] = $request->user()?->id ?? auth()->id();

        $listing = Listing::create($data);
        return response()->json($listing->load('images', 'host'), 201);
    }

    public function show(Listing $listing)
    {
        return response()->json($listing->load('images', 'host', 'reviews'));
    }

    public function update(Request $request, Listing $listing)
    {
        $data = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'sometimes|nullable|string',
            'type' => 'sometimes|in:car,home',
            'price_per_day' => 'sometimes|integer|min:0',
            'location' => 'sometimes|string|max:255',
            'status' => 'sometimes|in:active,paused',
        ]);

        $listing->update($data);
        return response()->json($listing->fresh()->load('images', 'host'));
    }

    public function destroy(Listing $listing)
    {
        $listing->delete();
        return response()->json(['deleted' => true]);
    }
}


