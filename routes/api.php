<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Broadcast;
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

Route::get('/health', function() {
    return response()->json(['status' => 'ok', 'timestamp' => now()]);
});

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

// Public listings
Route::get('/listings', [ListingController::class, 'publicIndex']);
Route::get('/listings/{listing}', [ListingController::class, 'publicShow']);
Route::get('/listings/{listingId}/availability', [BookingController::class, 'checkAvailability'])
    ->name('listings.availability');

// Public reviews
Route::get('/reviews', [ReviewController::class, 'index']);

/*
|--------------------------------------------------------------------------
| PROTECTED ROUTES (Authentication Required)
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {
    
    // IMPORTANT: Broadcasting auth route - MUST come first
    Broadcast::routes();
    
    // Auth routes
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/refresh', [AuthController::class, 'refresh']);
    Route::post('/verify-email/resend', [AuthController::class, 'resendVerification']);
    
    // User profile routes
    Route::get('/profile', [AuthController::class, 'profile']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);
    Route::put('/password', [AuthController::class, 'updatePassword']);
    Route::delete('/account', [AuthController::class, 'deleteAccount']);
    Route::get('/preferences', [AuthController::class, 'getPreferences']);
    Route::put('/preferences', [AuthController::class, 'updatePreferences']);
    
    // Conversation Management
    Route::prefix('conversations')->name('conversations.')->group(function () {
        Route::get('/', [MessageController::class, 'conversations'])->name('index');
        Route::post('/', [MessageController::class, 'startConversation'])->name('store');
        Route::get('/stats', [MessageController::class, 'getStats'])->name('stats');
        
        Route::prefix('{conversation}')->group(function () {
            Route::get('/messages', [MessageController::class, 'messages'])->name('messages');
            Route::post('/messages', [MessageController::class, 'send'])->name('send');
            Route::put('/read', [MessageController::class, 'markAsRead'])->name('read');
            Route::post('/typing', [MessageController::class, 'typing'])->name('typing');
        });
    });
    
    Route::delete('/messages/{message}', [MessageController::class, 'deleteMessage'])->name('messages.delete');
    Route::post('/contact-host', [MessageController::class, 'contactHost'])->name('contact-host');
    Route::post('/test-broadcast', [MessageController::class, 'testBroadcast']);
    
    // Debug routes
    Route::get('/test-auth', function (Request $request) {
        return response()->json([
            'authenticated' => true,
            'user' => $request->user(),
            'user_id' => auth()->id()
        ]);
    });
    
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
    
    // Host booking routes
    Route::get('/host/bookings', [BookingController::class, 'hostBookings']);
    Route::put('/host/bookings/{id}/confirm', [BookingController::class, 'confirm']);
    Route::put('/host/bookings/{id}/decline', [BookingController::class, 'decline']);
    
    // Host listings
    Route::prefix('host')->name('host.')->group(function () {
        Route::get('/listings', [ListingController::class, 'index'])->name('listings.index');
        Route::post('/listings', [ListingController::class, 'store'])->name('listings.store');
        Route::get('/listings/{id}', [ListingController::class, 'show'])->name('listings.show');
        Route::put('/listings/{id}', [ListingController::class, 'update'])->name('listings.update');
        Route::delete('/listings/{id}', [ListingController::class, 'destroy'])->name('listings.destroy');
    });
    
    Route::post('/test-upload', [ListingController::class, 'testUpload']);
    
    // Guest bookings
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
    
    // Email verification
    Route::get('/email/verify/{id}/{hash}', function (EmailVerificationRequest $request) {
        $request->fulfill();
        return response()->json(['message' => 'Email verified successfully']);
    })->name('verification.verify');
    
    Route::post('/email/verification-notify', function (Request $request) {
        $request->user()->sendEmailVerificationNotification();
        return response()->json(['message' => 'Verification email sent!']);
    })->name('verification.send');
});