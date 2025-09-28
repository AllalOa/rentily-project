<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Models\Conversation;
use App\Models\Message;
use App\Events\MessageSent;

class TestBroadcast extends Command
{
    protected $signature = 'test:broadcast';
    protected $description = 'Test broadcasting functionality';

    public function handle()
    {
        $this->info('Creating test data...');
        
        $user1 = User::firstOrCreate(
            ['email' => 'test1@example.com'], 
            ['name' => 'User 1', 'password' => bcrypt('password')]
        );

        $user2 = User::firstOrCreate(
            ['email' => 'test2@example.com'], 
            ['name' => 'User 2', 'password' => bcrypt('password')]
        );

        $conversation = Conversation::firstOrCreate([
            'host_id' => $user1->id,
            'renter_id' => $user2->id
        ]);

        $message = Message::create([
            'conversation_id' => $conversation->id,
            'sender_id' => $user1->id,
            'content' => 'Test broadcast message',
            'read_status' => false
        ]);

        $message->load('sender');

        $this->info('Broadcasting message...');
        broadcast(new MessageSent($message));

        $this->info('Message broadcast successfully!');
        $this->line("Message ID: {$message->id}");
        $this->line("Conversation ID: {$conversation->id}");

        return 0;
    }
}