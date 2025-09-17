import React, { useState, useEffect, useRef } from 'react'
import { 
  Search, 
  Send, 
  Paperclip, 
  Smile, 
  MoreVertical,
  Phone,
  Video,
  Info,
  Star,
  Flag,
  Archive,
  Trash2
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
// import { mockConversations, mockMessages } from '@/data/mockData'
import { api } from '@/services/api'
import { Conversation, Message } from '@/types'
import { formatRelativeTime } from '@/lib/utils'

export const MessagesPage: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Fetch conversations on component mount
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setLoading(true)
        const response = await api.get('/v1/conversations')
        const apiConversations = (response.data.data || []).map((conv: any) => ({
          id: String(conv.id),
          participants: [
            {
              id: String(conv.host?.id || ''),
              name: conv.host?.name || 'Host',
              email: conv.host?.email || '',
              avatar: conv.host?.avatar || '',
              isVerified: true,
              joinedAt: conv.host?.created_at || '',
              rating: 0,
              reviewCount: 0,
              isHost: true,
              preferences: {
                notifications: { email: true, sms: false, push: true },
                privacy: { showProfile: true, showBookings: false },
                currency: 'USD',
                language: 'en'
              }
            },
            {
              id: String(conv.renter?.id || ''),
              name: conv.renter?.name || 'Renter',
              email: conv.renter?.email || '',
              avatar: conv.renter?.avatar || '',
              isVerified: true,
              joinedAt: conv.renter?.created_at || '',
              rating: 0,
              reviewCount: 0,
              isHost: false,
              preferences: {
                notifications: { email: true, sms: false, push: true },
                privacy: { showProfile: true, showBookings: false },
                currency: 'USD',
                language: 'en'
              }
            }
          ],
          listing: conv.listing ? {
            id: String(conv.listing.id),
            title: conv.listing.title,
            images: [conv.listing.images?.[0]?.image_path || ''],
            location: {
              address: conv.listing.location,
              city: conv.listing.location,
              state: '',
              country: '',
              zipCode: '',
              coordinates: { lat: 0, lng: 0 },
            }
          } : null,
          lastMessage: conv.last_message ? {
            id: String(conv.last_message.id),
            conversationId: String(conv.id),
            senderId: String(conv.last_message.sender_id),
            sender: {
              id: String(conv.last_message.sender_id),
              name: 'User',
              email: '',
              avatar: '',
              isVerified: true,
              joinedAt: '',
              rating: 0,
              reviewCount: 0,
              isHost: false,
              preferences: {
                notifications: { email: true, sms: false, push: true },
                privacy: { showProfile: true, showBookings: false },
                currency: 'USD',
                language: 'en'
              }
            },
            content: conv.last_message.content,
            type: 'text' as const,
            isRead: true,
            createdAt: conv.last_message.created_at,
          } : null,
          unreadCount: 0,
          createdAt: conv.created_at,
          updatedAt: conv.updated_at || conv.created_at,
        }))
        setConversations(apiConversations)
      } catch (error) {
        console.error('Error fetching conversations:', error)
        setConversations([])
      } finally {
        setLoading(false)
      }
    }

    fetchConversations()
  }, [])

  useEffect(() => {
    if (selectedConversation) {
      // Fetch messages for selected conversation
      const fetchMessages = async () => {
        try {
          const response = await api.get(`/v1/conversations/${selectedConversation.id}/messages`)
          const apiMessages = (response.data.data || []).map((msg: any) => ({
            id: String(msg.id),
            conversationId: String(msg.conversation_id),
            senderId: String(msg.sender_id),
            sender: {
              id: String(msg.sender_id),
              name: msg.sender?.name || 'User',
              email: msg.sender?.email || '',
              avatar: msg.sender?.avatar || '',
              isVerified: true,
              joinedAt: msg.sender?.created_at || '',
              rating: 0,
              reviewCount: 0,
              isHost: false,
              preferences: {
                notifications: { email: true, sms: false, push: true },
                privacy: { showProfile: true, showBookings: false },
                currency: 'USD',
                language: 'en'
              }
            },
            content: msg.content,
            type: 'text' as const,
            isRead: true,
            createdAt: msg.created_at,
          }))
          setMessages(apiMessages)
        } catch (error) {
          console.error('Error fetching messages:', error)
          setMessages([])
        }
      }

      fetchMessages()
    }
  }, [selectedConversation])

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return

    try {
      const response = await api.post(`/v1/conversations/${selectedConversation.id}/messages`, {
        content: newMessage,
      })

      const newMessageData = response.data.data
      const message: Message = {
        id: String(newMessageData.id),
        conversationId: String(newMessageData.conversation_id),
        senderId: String(newMessageData.sender_id),
        sender: {
          id: String(newMessageData.sender_id),
          name: 'You',
          email: '',
          avatar: '',
          isVerified: true,
          joinedAt: '',
          rating: 0,
          reviewCount: 0,
          isHost: false,
          preferences: {
            notifications: { email: true, sms: false, push: true },
            privacy: { showProfile: true, showBookings: false },
            currency: 'USD',
            language: 'en'
          }
        },
        content: newMessageData.content,
        type: 'text',
        isRead: true,
        createdAt: newMessageData.created_at
      }

      setMessages(prev => [...prev, message])
      setNewMessage('')

      // Update conversation's last message
      setConversations(prev => 
        prev.map(conv => 
          conv.id === selectedConversation.id 
            ? { ...conv, lastMessage: message, updatedAt: new Date().toISOString() }
            : conv
        )
      )
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const filteredConversations = conversations.filter(conv => 
    conv.participants.some(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) || 
    (conv.listing?.title.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const renderConversationList = () => (
    <div className="w-full md:w-80 lg:w-96 border-r border-secondary-200 bg-white">
      {/* Header */}
      <div className="p-4 border-b border-secondary-200">
        <h2 className="text-lg font-semibold text-secondary-900 mb-4">Messages</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary-400" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
        {filteredConversations.length === 0 ? (
          <div className="p-4 text-center text-secondary-600">
            No conversations found
          </div>
        ) : (
          filteredConversations.map((conversation) => (
            <div
              key={conversation.id}
              onClick={() => setSelectedConversation(conversation)}
              className={`p-4 border-b border-secondary-100 cursor-pointer hover:bg-secondary-50 transition-colors duration-200 ${
                selectedConversation?.id === conversation.id ? 'bg-primary-50 border-l-4 border-l-primary-500' : ''
              }`}
            >
              <div className="flex items-start space-x-3">
                <Avatar
                  src={conversation.participants.find(p => p.id !== '1')?.avatar}
                  name={conversation.participants.find(p => p.id !== '1')?.name || 'User'}
                  size="md"
                  showOnlineStatus
                  isOnline={true}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-medium text-secondary-900 truncate">
                      {conversation.participants.find(p => p.id !== '1')?.name || 'Unknown User'}
                    </h3>
                    <span className="text-xs text-secondary-500">
                      {formatRelativeTime(conversation.updatedAt)}
                    </span>
                  </div>
                  
                  {conversation.listing && (
                    <p className="text-sm text-secondary-600 truncate mb-1">
                      {conversation.listing.title}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-secondary-600 truncate flex-1">
                      {conversation.lastMessage?.content || 'No messages yet'}
                    </p>
                    {conversation.unreadCount > 0 && (
                      <Badge variant="default" size="sm">
                        {conversation.unreadCount}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )

  const renderChatArea = () => {
    if (!selectedConversation) {
      return (
        <div className="flex-1 flex items-center justify-center bg-secondary-50">
          <div className="text-center">
            <div className="w-16 h-16 bg-secondary-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-secondary-400" />
            </div>
            <h3 className="text-lg font-medium text-secondary-900 mb-2">
              Select a conversation
            </h3>
            <p className="text-secondary-600">
              Choose a conversation from the list to start messaging
            </p>
          </div>
        </div>
      )
    }

    const otherParticipant = selectedConversation.participants.find(p => p.id !== '1')

    return (
      <div className="flex-1 flex flex-col bg-white">
        {/* Chat Header */}
        <div className="p-4 border-b border-secondary-200 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar
                src={otherParticipant?.avatar}
                name={otherParticipant?.name || 'User'}
                size="md"
                showOnlineStatus
                isOnline={true}
              />
              <div>
                <h3 className="font-semibold text-secondary-900">
                  {otherParticipant?.name || 'Unknown User'}
                </h3>
                <p className="text-sm text-secondary-600">
                  {selectedConversation.listing?.title}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm">
                <Phone className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Video className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Info className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-secondary-600">
              No messages yet. Start the conversation!
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.senderId === '1' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex space-x-2 max-w-xs lg:max-w-md ${message.senderId === '1' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  <Avatar
                    src={message.sender.avatar}
                    name={message.sender.name}
                    size="sm"
                  />
                  <div className={`flex flex-col ${message.senderId === '1' ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`px-4 py-2 rounded-lg ${
                        message.senderId === '1'
                          ? 'bg-primary-600 text-white'
                          : 'bg-secondary-100 text-secondary-900'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                    </div>
                    <span className="text-xs text-secondary-500 mt-1">
                      {formatRelativeTime(message.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="p-4 border-t border-secondary-200 bg-white">
          <div className="flex items-end space-x-2">
            <Button variant="ghost" size="sm">
              <Paperclip className="h-4 w-4" />
            </Button>
            <div className="flex-1">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                className="w-full px-3 py-2 border border-secondary-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
                rows={1}
                style={{ minHeight: '40px', maxHeight: '120px' }}
              />
            </div>
            <Button variant="ghost" size="sm">
              <Smile className="h-4 w-4" />
            </Button>
            <Button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              size="sm"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-secondary-900 mb-2">
            Messages
          </h1>
          <p className="text-secondary-600">
            Communicate with hosts and guests
          </p>
        </div>

        {/* Messages Interface */}
        <Card className="overflow-hidden h-[calc(100vh-200px)]">
          <div className="flex h-full">
            {renderConversationList()}
            {renderChatArea()}
          </div>
        </Card>
      </div>
    </div>
  )
}
