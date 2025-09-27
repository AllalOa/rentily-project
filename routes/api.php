<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ListingController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\MessageController;
use App\Http\Controllers\Api\FavoriteController;
use App\Http\Controllers\Api\AuthController;
use Illuminate\Foundation\Auth\EmailVerificationRequest;
use Illuminate\Http\Request;

/*
|--------------------------------------------------------------------------
| PUBLIC ROUTES (No Authentication Required)
|--------------------------------------------------------------------------
*/

// Health check route
Route::get('/health', function() {
    return response()->json(['status' => 'ok', 'timestamp' => now()]);
});

// Test route to verify API is working
Route::get('/test-api-loaded', function() {
    return response()->json([
        'message' => 'API routes file loaded successfully',
        'timestamp' => now(),
        'laravel_version' => app()->version()
    ]);
});

// Public authentication routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);
Route::post('/verify-email', [AuthController::class, 'verifyEmail']);

// Public listings (for browsing) - no authentication required
Route::get('/listings', [ListingController::class, 'publicIndex']);
Route::get('/listings/{listing}', [ListingController::class, 'publicShow']);

// Public reviews - no authentication required
Route::get('/reviews', [ReviewController::class, 'index']);

// IMPORTANT: Check availability (PUBLIC route - no auth required)
Route::get('/listings/{listingId}/availability', [BookingController::class, 'checkAvailability'])
    ->name('listings.availability');

/*
|--------------------------------------------------------------------------
| PROTECTED ROUTES (Authentication Required)
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {
    
    // Debug and test routes
    Route::get('/test-auth', function (Request $request) {
        return response()->json([
            'authenticated' => true,
            'user' => $request->user(),
            'user_id' => auth()->id()
        ]);
    });

    // Test route for debugging decline functionality
    Route::put('/test-decline-simple/{id}', function($id) {
        try {
            \Log::info('Simple test route called with ID: ' . $id);
            return response()->json([
                'success' => true,
                'message' => 'Test route works',
                'id' => $id,
                'user_id' => auth()->id()
            ]);
        } catch (\Exception $e) {
            \Log::error('Test route error: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    });

    // Auth routes
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/refresh', [AuthController::class, 'refresh']);
    Route::post('/verify-email/resend', [AuthController::class, 'resendVerification']);
    
    // User profile routes
    Route::get('/profile', [AuthController::class, 'profile']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);
    Route::put('/password', [AuthController::class, 'updatePassword']);
    Route::delete('/account', [AuthController::class, 'deleteAccount']);
    
    // User preferences
    Route::get('/preferences', [AuthController::class, 'getPreferences']);
    Route::put('/preferences', [AuthController::class, 'updatePreferences']);

    // Test upload route
    Route::post('/test-upload', [ListingController::class, 'testUpload']);

    // DIRECT HOST BOOKING ROUTES (No prefix/grouping complexity)
    Route::get('/host/bookings', [BookingController::class, 'hostBookings']);
    Route::put('/host/bookings/{id}/confirm', [BookingController::class, 'confirm']);
    Route::put('/host/bookings/{id}/decline', [BookingController::class, 'decline']);

    // Host Listings CRUD (keeping the prefix structure for other routes)
    Route::prefix('host')->name('host.')->group(function () {
        Route::get('/listings', [ListingController::class, 'index'])->name('listings.index');
        Route::post('/listings', [ListingController::class, 'store'])->name('listings.store');
        Route::get('/listings/{id}', [ListingController::class, 'show'])->name('listings.show');
        Route::put('/listings/{id}', [ListingController::class, 'update'])->name('listings.update');
        Route::delete('/listings/{id}', [ListingController::class, 'destroy'])->name('listings.destroy');
    });

    // Bookings (guest bookings)
    Route::get('/bookings', [BookingController::class, 'index'])->name('bookings.index');
    Route::post('/bookings', [BookingController::class, 'store'])->name('bookings.store');
    Route::get('/bookings/{booking}', [BookingController::class, 'show'])->name('bookings.show');
    Route::put('/bookings/{booking}/cancel', [BookingController::class, 'cancel'])->name('bookings.cancel');

    // Reviews
    Route::post('/reviews', [ReviewController::class, 'store'])->name('reviews.store');
    Route::get('/reviews/{review}', [ReviewController::class, 'show'])->name('reviews.show');
    Route::put('/reviews/{review}', [ReviewController::class, 'update'])->name('reviews.update');
    Route::delete('/reviews/{review}', [ReviewController::class, 'destroy'])->name('reviews.destroy');

    // Favorites
    Route::get('/favorites', [FavoriteController::class, 'index'])->name('favorites.index');
    Route::post('/favorites', [FavoriteController::class, 'store'])->name('favorites.store');
    Route::delete('/favorites/{listing}', [FavoriteController::class, 'destroy'])->name('favorites.destroy');

    // Messaging
    Route::get('/conversations', [MessageController::class, 'conversations'])->name('conversations.index');
    Route::post('/conversations', [MessageController::class, 'startConversation'])->name('conversations.store');
    Route::get('/conversations/{conversation}/messages', [MessageController::class, 'messages'])->name('conversations.messages');
    Route::post('/conversations/{conversation}/messages', [MessageController::class, 'send'])->name('conversations.send');

    // Email verification routes
    Route::get('/email/verify/{id}/{hash}', function (EmailVerificationRequest $request) {
        $request->fulfill();
        return response()->json(['message' => 'Email verified successfully']);
    })->name('verification.verify');

    Route::post('/email/verification-notify', function (Request $request) {
        $request->user()->sendEmailVerificationNotification();
        return response()->json(['message' => 'Verification email sent!']);
    })->name('verification.send');
});