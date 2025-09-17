<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Favorite;
use Illuminate\Http\Request;

class FavoriteController extends Controller
{
    public function index(Request $request)
    {
        $favorites = Favorite::with('listing.images')
            ->where('user_id', auth()->id())
            ->latest()
            ->paginate(20);
        return response()->json($favorites);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'listing_id' => 'required|exists:listings,id',
        ]);
        $fav = Favorite::firstOrCreate([
            'user_id' => auth()->id(),
            'listing_id' => $data['listing_id'],
        ]);
        return response()->json($fav->load('listing'), 201);
    }

    public function destroy($listingId)
    {
        Favorite::where('user_id', auth()->id())
            ->where('listing_id', $listingId)
            ->delete();
        return response()->json(['deleted' => true]);
    }
}


