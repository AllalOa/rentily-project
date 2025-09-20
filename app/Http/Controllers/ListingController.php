<?php

namespace App\Http\Controllers;

use App\Models\Listing;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class ListingController extends Controller
{
    // Public method for browsing listings
    public function publicIndex(Request $request)
    {
        $query = Listing::where('status', 'active');

        if ($request->filled('type') && in_array($request->type, ['car', 'home'], true)) {
            $query->where('type', $request->type);
        }

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('title', 'like', '%' . $request->search . '%')
                  ->orWhere('description', 'like', '%' . $request->search . '%')
                  ->orWhere('location', 'like', '%' . $request->search . '%');
            });
        }

        $listings = $query->with('images', 'user')->paginate(12);

        return response()->json($listings);
    }

    // Public method for showing a single listing
    public function publicShow($id)
    {
        $listing = Listing::with('images', 'user')->where('status', 'active')->findOrFail($id);
        return response()->json($listing);
    }

    // List the logged-in host's listings
    public function index(Request $request)
    {
        $query = Listing::where('user_id', Auth::id());

        if ($request->filled('status') && in_array($request->status, ['active', 'paused'], true)) {
            $query->where('status', $request->status);
        }

        $listings = $query->with('images')->get();

        return response()->json($listings);
    }

    // Store new listing
    public function store(Request $request)
    {
        // Debug request
        \Log::info('Store request data:', $request->all());
        \Log::info('Store request files:', $request->allFiles());

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => ['required', Rule::in(['car', 'home'])],
            'price_per_day' => 'required|integer|min:0',
            'location' => 'required|string|max:255',
            'status' => ['required', Rule::in(['active', 'paused'])],
            'images' => 'nullable|array|max:10',
            'images.*' => 'image|mimes:jpeg,png,jpg,gif,webp|max:5120', // 5MB max per image
        ]);

        \Log::info('Authenticated user ID: ' . auth()->id());

        $listing = Listing::create([
            'user_id' => auth()->id(),
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'type' => $validated['type'],
            'price_per_day' => $validated['price_per_day'],
            'location' => $validated['location'],
            'status' => $validated['status'],
        ]);

        // Handle images upload if any
        if ($request->hasFile('images')) {
            \Log::info('Processing ' . count($request->file('images')) . ' images');
            
            foreach ($request->file('images') as $index => $imageFile) {
                try {
                    \Log::info("Processing image {$index}: {$imageFile->getClientOriginalName()}, Size: {$imageFile->getSize()}, Type: {$imageFile->getMimeType()}");
                    
                    // Generate unique filename
                    $fileName = time() . '_' . $index . '_' . $imageFile->getClientOriginalName();
                    
                    // Store the image in public disk under 'listing_images' directory
                    $path = $imageFile->storeAs('listing_images', $fileName, 'public');
                    
                    \Log::info("Image stored at path: {$path}");

                    // Create a related record in listing_images table
                    $imageRecord = $listing->images()->create([
                        'image_path' => $path,
                        'position' => $index,
                    ]);
                    
                    \Log::info("Image record created: {$imageRecord->id}");
                    
                } catch (\Exception $e) {
                    \Log::error('Image upload failed: ' . $e->getMessage());
                    \Log::error('Stack trace: ' . $e->getTraceAsString());
                    
                    // Clean up - delete created listing and any uploaded images
                    foreach ($listing->images as $image) {
                        Storage::disk('public')->delete($image->image_path);
                        $image->delete();
                    }
                    $listing->delete();
                    
                    return response()->json([
                        'error' => 'Image upload failed: ' . $e->getMessage()
                    ], 500);
                }
            }
        } else {
            \Log::info('No images provided in request');
        }

        return response()->json($listing->load('images'), 201);
    }

    // Show a listing
    public function show($id)
    {
        $listing = Listing::with('images')->where('user_id', Auth::id())->findOrFail($id);
        return response()->json($listing);
    }

    // Update listing
    public function update(Request $request, $id)
    {
        // Debug request
        \Log::info('Update request data:', $request->all());
        \Log::info('Update request files:', $request->allFiles());

        $listing = Listing::where('user_id', Auth::id())->findOrFail($id);

        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'type' => ['sometimes', Rule::in(['car', 'home'])],
            'price_per_day' => 'sometimes|required|integer|min:0',
            'location' => 'sometimes|required|string|max:255',
            'status' => ['sometimes', Rule::in(['active', 'paused'])],
            'images' => 'nullable|array|max:10',
            'images.*' => 'image|mimes:jpeg,png,jpg,gif,webp|max:5120',
        ]);

        // Update basic fields
        $listing->update(array_filter($validated, fn($key) => $key !== 'images', ARRAY_FILTER_USE_KEY));

        // Handle images if provided
        if ($request->hasFile('images')) {
            \Log::info('Updating images - deleting old ones');
            
            // Delete old images from storage and DB
            foreach ($listing->images as $image) {
                Storage::disk('public')->delete($image->image_path);
                $image->delete();
            }

            // Upload and create new images records
            foreach ($request->file('images') as $index => $imageFile) {
                try {
                    \Log::info("Processing new image {$index}: {$imageFile->getClientOriginalName()}");
                    
                    $fileName = time() . '_' . $index . '_' . $imageFile->getClientOriginalName();
                    $path = $imageFile->storeAs('listing_images', $fileName, 'public');
                    
                    $listing->images()->create([
                        'image_path' => $path,
                        'position' => $index,
                    ]);
                    
                } catch (\Exception $e) {
                    \Log::error('Image update failed: ' . $e->getMessage());
                    return response()->json([
                        'error' => 'Image update failed: ' . $e->getMessage()
                    ], 500);
                }
            }
        }

        return response()->json($listing->load('images'));
    }

    // Delete listing
    public function destroy($id)
    {
        $listing = Listing::where('user_id', Auth::id())->findOrFail($id);

        // Delete images files and their records
        foreach ($listing->images as $image) {
            Storage::disk('public')->delete($image->image_path);
            $image->delete();
        }

        $listing->delete();

        return response()->json(['message' => 'Listing deleted']);
    }

    // In your controller
public function testUpload(Request $request)
{
    \Log::info('Test upload request:', $request->all());
    \Log::info('Files:', $request->allFiles());
    
    if ($request->hasFile('images')) {
        foreach ($request->file('images') as $file) {
            \Log::info('File details:', [
                'original_name' => $file->getClientOriginalName(),
                'size' => $file->getSize(),
                'mime_type' => $file->getMimeType(),
            ]);
        }
        return response()->json(['success' => true, 'files_received' => count($request->file('images'))]);
    }
    
    return response()->json(['success' => false, 'message' => 'No files received']);
}
}