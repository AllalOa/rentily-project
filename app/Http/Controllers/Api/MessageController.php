<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\Listing;
use App\Events\MessageSent;
use App\Events\UserTyping;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class MessageController extends Controller
{
    /**
     * Get all conversations for the authenticated user
     */
    public function conversations(Request $request)
    {
        $userId = auth()->id();
        
        $conversations = Conversation::with(['host', 'renter'])
            ->where(function ($query) use ($userId) {
                $query->where('host_id', $userId)
                      ->orWhere('renter_id', $userId);
            })
            ->withCount(['messages as unread_count' => function ($query) use ($userId) {
                $query->where('sender_id', '!=', $userId)
                      ->where('read_status', false);
            }])
            ->with(['lastMessage' => function ($query) {
                $query->latest()->with('sender');
            }])
            ->orderByDesc('updated_at')
            ->paginate(20);

        // Add last_message to each conversation for easier frontend access
        $conversations->getCollection()->transform(function ($conversation) {
            $lastMessage = $conversation->lastMessage->first();
            $conversation->last_message = $lastMessage;
            unset($conversation->lastMessage); // Remove the relationship to avoid confusion
            return $conversation;
        });

        return response()->json([
            'success' => true,
            'data' => $conversations->items(),
            'pagination' => [
                'current_page' => $conversations->currentPage(),
                'last_page' => $conversations->lastPage(),
                'per_page' => $conversations->perPage(),
                'total' => $conversations->total(),
            ]
        ]);
    }

    /**
     * Start a new conversation between host and renter
     */
    public function startConversation(Request $request)
    {
        $data = $request->validate([
            'host_id' => 'required|exists:users,id',
            'renter_id' => 'required|exists:users,id',
        ]);

        $userId = auth()->id();

        // Ensure the authenticated user is either the host or renter
        if ($userId != $data['host_id'] && $userId != $data['renter_id']) {
            return response()->json([
                'success' => false,
                'message' => 'You can only create conversations where you are a participant'
            ], 403);
        }

        // Check if conversation already exists
        $conversation = Conversation::where(function ($query) use ($data) {
            $query->where('host_id', $data['host_id'])
                  ->where('renter_id', $data['renter_id']);
        })->orWhere(function ($query) use ($data) {
            $query->where('host_id', $data['renter_id'])
                  ->where('renter_id', $data['host_id']);
        })->first();

        if (!$conversation) {
            $conversation = Conversation::create($data);
            $conversation->load(['host', 'renter']);
        }

        return response()->json([
            'success' => true,
            'data' => $conversation
        ], 201);
    }

    /**
     * Get messages for a specific conversation
     */
    public function messages(Request $request, Conversation $conversation)
    {
        // Check if user is participant
        if (!$conversation->isParticipant(auth()->id())) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access to conversation'
            ], 403);
        }

        $messages = $conversation->messages()
            ->with('sender:id,name,email,avatar')
            ->orderBy('created_at', 'asc')
            ->paginate(50);

        // Mark messages as read for the current user
        $conversation->markAsReadForUser(auth()->id());

        return response()->json([
            'success' => true,
            'data' => $messages->items(),
            'pagination' => [
                'current_page' => $messages->currentPage(),
                'last_page' => $messages->lastPage(),
                'per_page' => $messages->perPage(),
                'total' => $messages->total(),
            ]
        ]);
    }

    /**
     * Send a new message
     */
    public function send(Request $request, Conversation $conversation)
    {
        // Check if user is participant
        if (!$conversation->isParticipant(auth()->id())) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access to conversation'
            ], 403);
        }

        $data = $request->validate([
            'content' => 'required|string|max:2000',
            'attachment' => 'nullable|file|max:10240' // 10MB max
        ]);

        DB::beginTransaction();
        try {
            $attachmentPath = null;

            // Handle file attachment if provided
            if ($request->hasFile('attachment')) {
                $attachmentPath = $request->file('attachment')->store('chat-attachments', 'public');
            }

            // Create the message
            $message = $conversation->messages()->create([
                'sender_id' => auth()->id(),
                'content' => trim($data['content']),
                'attachment' => $attachmentPath,
                'read_status' => false,
            ]);

            // Update conversation's updated_at timestamp
            $conversation->touch();

            // Load the sender relationship
            $message->load('sender:id,name,email,avatar');

            // Broadcast the message to all conversation participants
            broadcast(new MessageSent($message))->toOthers();

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => $message
            ], 201);

        } catch (\Exception $e) {
            DB::rollback();
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to send message',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Mark conversation as read
     */
    public function markAsRead(Conversation $conversation)
    {
        if (!$conversation->isParticipant(auth()->id())) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access to conversation'
            ], 403);
        }

        $conversation->markAsReadForUser(auth()->id());

        return response()->json([
            'success' => true,
            'message' => 'Conversation marked as read'
        ]);
    }

    /**
     * Broadcast typing indicator
     */
    public function typing(Request $request, Conversation $conversation)
    {
        if (!$conversation->isParticipant(auth()->id())) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access to conversation'
            ], 403);
        }

        $data = $request->validate([
            'is_typing' => 'required|boolean'
        ]);

        $user = auth()->user();

        broadcast(new UserTyping(
            $conversation->id,
            $user->id,
            $user->name,
            $data['is_typing']
        ))->toOthers();

        return response()->json([
            'success' => true,
            'message' => 'Typing status broadcasted'
        ]);
    }

    /**
     * Delete a message (soft delete or actual delete based on business logic)
     */
    public function deleteMessage(Message $message)
    {
        $conversation = $message->conversation;
        
        // Check if user is the sender
        if ($message->sender_id !== auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'You can only delete your own messages'
            ], 403);
        }

        // Only allow deletion within 24 hours
        if ($message->created_at->diffInHours() <= 24) {
            $message->delete();
            
            return response()->json([
                'success' => true,
                'message' => 'Message deleted successfully'
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Messages can only be deleted within 24 hours'
        ], 422);
    }

    /**
     * Get conversation statistics
     */
    public function getStats()
    {
        $userId = auth()->id();
        
        $stats = [
            'total_conversations' => Conversation::where('host_id', $userId)
                ->orWhere('renter_id', $userId)
                ->count(),
            'unread_conversations' => Conversation::where(function ($query) use ($userId) {
                    $query->where('host_id', $userId)
                          ->orWhere('renter_id', $userId);
                })
                ->withCount(['messages as unread_count' => function ($query) use ($userId) {
                    $query->where('sender_id', '!=', $userId)
                          ->where('read_status', false);
                }])
                ->having('unread_count', '>', 0)
                ->count(),
            'total_messages_sent' => Message::where('sender_id', $userId)->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }

    /**
     * Start conversation from listing (Contact Host functionality)
     */
    public function contactHost(Request $request)
    {
        $data = $request->validate([
            'listing_id' => 'required|exists:listings,id',
            'message' => 'required|string|max:1000'
        ]);

        $listing = Listing::findOrFail($data['listing_id']);
        $userId = auth()->id();

        // Check if user is trying to contact themselves
        if ($listing->user_id == $userId) {
            return response()->json([
                'success' => false,
                'message' => 'You cannot contact yourself'
            ], 422);
        }

        DB::beginTransaction();
        try {
            // Create or find conversation between user and listing owner
            $conversation = Conversation::firstOrCreate([
                'host_id' => $listing->user_id,
                'renter_id' => $userId
            ]);

            // Send the initial message
            $message = $conversation->messages()->create([
                'sender_id' => $userId,
                'content' => $data['message'],
                'read_status' => false
            ]);

            $conversation->touch();
            $message->load('sender:id,name,email,avatar');

            // Broadcast the message
            broadcast(new MessageSent($message))->toOthers();

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => [
                    'conversation' => $conversation->load(['host', 'renter']),
                    'message' => $message
                ],
                'message' => 'Message sent successfully!'
            ]);

        } catch (\Exception $e) {
            DB::rollback();
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to send message',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }
}