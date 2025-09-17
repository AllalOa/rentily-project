<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Models\Message;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    public function conversations(Request $request)
    {
        $userId = auth()->id();
        $conversations = Conversation::with(['host', 'renter'])
            ->where(fn($q) => $q->where('host_id', $userId)->orWhere('renter_id', $userId))
            ->latest()
            ->paginate(20);
        return response()->json($conversations);
    }

    public function startConversation(Request $request)
    {
        $data = $request->validate([
            'host_id' => 'required|exists:users,id',
            'renter_id' => 'required|exists:users,id',
        ]);

        $conversation = Conversation::firstOrCreate($data);
        return response()->json($conversation, 201);
    }

    public function messages(Conversation $conversation)
    {
        $messages = $conversation->messages()->with('sender')->orderBy('created_at')->paginate(50);
        return response()->json($messages);
    }

    public function send(Request $request, Conversation $conversation)
    {
        $data = $request->validate([
            'content' => 'required|string',
        ]);

        $message = $conversation->messages()->create([
            'sender_id' => auth()->id(),
            'content' => $data['content'],
            'read_status' => false,
        ]);

        return response()->json($message->load('sender'), 201);
    }
}


