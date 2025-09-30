<?php
// config/broadcasting.php - Make sure Reverb is properly configured

return [
    'default' => env('BROADCAST_DRIVER', 'null'),

    'connections' => [
        'reverb' => [
            'driver' => 'reverb',
            'key' => env('REVERB_APP_KEY'),
            'secret' => env('REVERB_APP_SECRET'),
            'app_id' => env('REVERB_APP_ID'),
            'options' => [
                'host' => '127.0.0.1',
                'port' => env('REVERB_SERVER_PORT', 9001),
                'scheme' => env('REVERB_SCHEME', 'http'),
                'useTLS' => env('REVERB_SCHEME', 'http') === 'https',
            ],
        ],
    ],
];

// routes/channels.php - Add proper channel authorization
use Illuminate\Support\Facades\Broadcast;
use App\Models\Conversation;

Broadcast::channel('conversation.{conversationId}', function ($user, $conversationId) {
    // Check if the user is a participant in this conversation
    $conversation = Conversation::find($conversationId);
    
    if (!$conversation) {
        return false;
    }
    
    return $conversation->isParticipant($user->id);
});
