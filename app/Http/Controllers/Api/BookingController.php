<?php

namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller; // This line was missing
use App\Models\Booking;
use App\Models\Listing;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;
use Exception;

class BookingController extends Controller
{
    /**
     * Check availability for a listing
     * Public endpoint - no authentication required
     */
    public function checkAvailability(Request $request, $listingId)
    {
        try {
            // Log the incoming request
            Log::info('API Availability check request', [
                'listing_id' => $listingId,
                'request_data' => $request->all(),
                'url' => $request->fullUrl(),
                'query_params' => $request->query(),
                'method' => $request->method()
            ]);

            // Validate input
            $validator = Validator::make($request->all(), [
                'start_date' => 'required|date_format:Y-m-d|after_or_equal:today',
                'end_date' => 'required|date_format:Y-m-d|after:start_date',
            ], [
                'start_date.required' => 'Start date is required',
                'start_date.date_format' => 'Start date must be in YYYY-MM-DD format',
                'start_date.after_or_equal' => 'Start date must be today or later',
                'end_date.required' => 'End date is required',
                'end_date.date_format' => 'End date must be in YYYY-MM-DD format',
                'end_date.after' => 'End date must be after start date',
            ]);

            if ($validator->fails()) {
                Log::warning('API Availability validation failed', [
                    'errors' => $validator->errors()->toArray(),
                    'input' => $request->all()
                ]);
                
                return response()->json([
                    'available' => false,
                    'message' => 'Invalid input data',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Find the listing
            $listing = Listing::find($listingId);
            if (!$listing) {
                Log::warning('Listing not found', ['listing_id' => $listingId]);
                return response()->json([
                    'available' => false,
                    'message' => 'Listing not found'
                ], 404);
            }

            // Check if listing is active
            if ($listing->status !== 'active') {
                return response()->json([
                    'available' => false,
                    'message' => 'This listing is not available for booking'
                ], 400);
            }

            // Parse dates
            $startDate = Carbon::createFromFormat('Y-m-d', $request->start_date)->startOfDay();
            $endDate = Carbon::createFromFormat('Y-m-d', $request->end_date)->startOfDay();

            Log::info('Checking availability for dates', [
                'start_date' => $startDate->toDateString(),
                'end_date' => $endDate->toDateString(),
                'listing_id' => $listingId
            ]);

            // Check for conflicting bookings - FIXED OVERLAP LOGIC
            $conflictingBookings = Booking::where('listing_id', $listingId)
                ->whereIn('status', ['pending', 'confirmed'])
                ->where(function ($query) use ($startDate, $endDate) {
                    // Simplified overlap check: two date ranges overlap if start1 < end2 and start2 < end1
                    $query->where('start_date', '<', $endDate)
                          ->where('end_date', '>', $startDate);
                })
                ->get();

            Log::info('Conflicting bookings query result', [
                'count' => $conflictingBookings->count(),
                'bookings' => $conflictingBookings->map(function($booking) {
                    return [
                        'id' => $booking->id,
                        'start_date' => $booking->start_date->toDateString(),
                        'end_date' => $booking->end_date->toDateString(),
                        'status' => $booking->status
                    ];
                })->toArray()
            ]);

            if ($conflictingBookings->count() > 0) {
                return response()->json([
                    'available' => false,
                    'message' => 'The selected dates are not available',
                    'conflicting_dates' => $conflictingBookings->map(function($booking) {
                        return [
                            'start_date' => $booking->start_date->toDateString(),
                            'end_date' => $booking->end_date->toDateString()
                        ];
                    })
                ], 409);
            }

            // Calculate pricing
            $days = $startDate->diffInDays($endDate);
            if ($days <= 0) {
                return response()->json([
                    'available' => false,
                    'message' => 'Invalid date range - end date must be after start date'
                ], 422);
            }

            $pricePerDay = (float) $listing->price_per_day;
            $subtotal = $days * $pricePerDay;
            $serviceFee = round($subtotal * 0.1, 2);
            $total = $subtotal + $serviceFee;

            $response = [
                'available' => true,
                'message' => 'Dates are available',
                'pricing' => [
                    'days' => $days,
                    'price_per_day' => $pricePerDay,
                    'subtotal' => $subtotal,
                    'service_fee' => $serviceFee,
                    'total' => $total
                ]
            ];

            Log::info('API Availability check successful', [
                'listing_id' => $listingId,
                'response' => $response
            ]);

            return response()->json($response);

        } catch (Exception $e) {
            Log::error('API Availability check error', [
                'listing_id' => $listingId,
                'error_message' => $e->getMessage(),
                'error_file' => $e->getFile(),
                'error_line' => $e->getLine(),
                'stack_trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'available' => false,
                'message' => 'Internal server error while checking availability',
                'debug' => config('app.debug') ? [
                    'error' => $e->getMessage(),
                    'file' => basename($e->getFile()),
                    'line' => $e->getLine()
                ] : null
            ], 500);
        }
    }

    // Create a new booking
    public function store(Request $request)
    {
        try {
            Log::info('Booking creation request', [
                'user_id' => Auth::id(),
                'request_data' => $request->all()
            ]);

            $validator = Validator::make($request->all(), [
                'listing_id' => 'required|exists:listings,id',
                'start_date' => 'required|date|after_or_equal:today',
                'end_date' => 'required|date|after:start_date',
                'guests' => 'required|integer|min:1|max:20',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $listing = Listing::findOrFail($request->listing_id);

            // Check if user is trying to book their own listing
            if ($listing->user_id === Auth::id()) {
                return response()->json([
                    'success' => false,
                    'message' => 'You cannot book your own listing'
                ], 403);
            }

            // Create a new request object for availability check
            $availabilityRequest = new Request([
                'start_date' => Carbon::parse($request->start_date)->format('Y-m-d'),
                'end_date' => Carbon::parse($request->end_date)->format('Y-m-d')
            ]);

            // Double-check availability
            $availabilityCheck = $this->checkAvailability($availabilityRequest, $request->listing_id);
            $availabilityData = json_decode($availabilityCheck->getContent(), true);
            
            if (!$availabilityData['available']) {
                return response()->json([
                    'success' => false,
                    'message' => $availabilityData['message'] ?? 'Selected dates are not available'
                ], 409);
            }

            $startDate = Carbon::parse($request->start_date);
            $endDate = Carbon::parse($request->end_date);
            $days = $startDate->diffInDays($endDate);
            $subtotal = $days * $listing->price_per_day;
            $serviceFee = round($subtotal * 0.1, 2);
            $total = $subtotal + $serviceFee;

            $booking = Booking::create([
                'listing_id' => $request->listing_id,
                'user_id' => Auth::id(),
                'host_id' => $listing->user_id,
                'start_date' => $startDate,
                'end_date' => $endDate,
                'guests' => $request->guests,
                'total_price' => $total,
                'status' => 'pending'
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Booking created successfully',
                'booking' => $booking->load('listing.images', 'listing.host', 'host')
            ], 201);

        } catch (Exception $e) {
            Log::error('Booking creation failed', [
                'user_id' => Auth::id(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to create booking'
            ], 500);
        }
    }

    // Get user's bookings
    public function index(Request $request)
    {
        try {
            $query = Booking::with(['listing.images', 'listing.host', 'host'])
                ->where('user_id', Auth::id());

            if ($request->filled('status')) {
                $query->where('status', $request->status);
            }

            $bookings = $query->orderBy('created_at', 'desc')->get();

            return response()->json($bookings);
        } catch (Exception $e) {
            Log::error('Error fetching user bookings', [
                'user_id' => Auth::id(),
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'error' => 'Failed to fetch bookings'
            ], 500);
        }
    }

    // Get specific booking
    public function show($id)
    {
        try {
            $booking = Booking::with(['listing.images', 'listing.host', 'host'])
                ->where('user_id', Auth::id())
                ->findOrFail($id);

            return response()->json($booking);
        } catch (Exception $e) {
            Log::error('Error fetching booking', [
                'booking_id' => $id,
                'user_id' => Auth::id(),
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'error' => 'Booking not found'
            ], 404);
        }
    }

    // Cancel booking
    public function cancel($id)
    {
        try {
            $booking = Booking::where('user_id', Auth::id())->findOrFail($id);

            if ($booking->status !== 'pending') {
                return response()->json([
                    'success' => false,
                    'message' => 'Only pending bookings can be cancelled'
                ], 400);
            }

            $booking->update(['status' => 'cancelled']);

            return response()->json([
                'success' => true,
                'message' => 'Booking cancelled successfully',
                'booking' => $booking
            ]);
        } catch (Exception $e) {
            Log::error('Error cancelling booking', [
                'booking_id' => $id,
                'user_id' => Auth::id(),
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to cancel booking'
            ], 500);
        }
    }

    // Get host's bookings (for host dashboard)
    public function hostBookings(Request $request)
    {
        try {
            Log::info('Host bookings request', [
                'user_id' => Auth::id(),
                'status_filter' => $request->get('status')
            ]);

            $query = Booking::with(['listing.images', 'user'])
                ->where('host_id', Auth::id());

            if ($request->filled('status')) {
                $query->where('status', $request->status);
            }

            $bookings = $query->orderBy('created_at', 'desc')->get();

            // Transform the data
            $transformedBookings = $bookings->map(function ($booking) {
                return [
                    'id' => $booking->id,
                    'listing_id' => $booking->listing_id,
                    'user_id' => $booking->user_id,
                    'host_id' => $booking->host_id,
                    'start_date' => $booking->start_date,
                    'end_date' => $booking->end_date,
                    'guests' => $booking->guests,
                    'total_price' => $booking->total_price,
                    'status' => $booking->status,
                    'created_at' => $booking->created_at,
                    'updated_at' => $booking->updated_at,
                    'listing' => $booking->listing ? [
                        'id' => $booking->listing->id,
                        'title' => $booking->listing->title,
                        'images' => $booking->listing->images ?? []
                    ] : null,
                    'renter' => $booking->user ? [
                        'id' => $booking->user->id,
                        'name' => $booking->user->name,
                        'email' => $booking->user->email ?? null,
                        'phone' => $booking->user->phone ?? null
                    ] : null
                ];
            });

            return response()->json($transformedBookings);

        } catch (Exception $e) {
            Log::error('Error fetching host bookings', [
                'user_id' => Auth::id(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'error' => 'Internal server error',
                'message' => 'Failed to fetch bookings'
            ], 500);
        }
    }

    // Confirm booking (host only)
    public function confirm($id)
    {
        try {
            $booking = Booking::with('listing')
                ->where('host_id', Auth::id())
                ->findOrFail($id);

            if ($booking->status !== 'pending') {
                return response()->json([
                    'success' => false,
                    'message' => 'Only pending bookings can be confirmed'
                ], 400);
            }

            $booking->update(['status' => 'confirmed']);

            return response()->json([
                'success' => true,
                'message' => 'Booking confirmed successfully',
                'booking' => $booking
            ]);

        } catch (Exception $e) {
            Log::error('Error confirming booking', [
                'booking_id' => $id,
                'user_id' => Auth::id(),
                'error' => $e->getMessage()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to confirm booking'
            ], 500);
        }
    }

    // Decline booking (host only)
    public function decline($id)
    {
        try {
            $booking = Booking::with('listing')
                ->where('host_id', Auth::id())
                ->findOrFail($id);

            if ($booking->status !== 'pending') {
                return response()->json([
                    'success' => false,
                    'message' => 'Only pending bookings can be declined'
                ], 400);
            }

            $booking->update(['status' => 'declined']);

            return response()->json([
                'success' => true,
                'message' => 'Booking declined',
                'booking' => $booking
            ]);

        } catch (Exception $e) {
            Log::error('Error declining booking', [
                'booking_id' => $id,
                'user_id' => Auth::id(),
                'error' => $e->getMessage()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to decline booking'
            ], 500);
        }
    }
}