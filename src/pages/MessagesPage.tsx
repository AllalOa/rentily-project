import React, { useState, useEffect, useRef, useCallback } from 'react'
import { 
  Search, 
  Send, 
  Paperclip, 
  Smile, 
  MoreVertical,
  Phone,
  Video,
  Info,
  Loader2,
  User,
  ArrowLeft,
  Wifi,
  WifiOff
} from 'lucide-react'
import Echo from 'laravel-echo'
import Pusher from 'pusher-js'

window.Pusher = Pusher

// UI Components
const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
    {children}
  </div>
)

const Button = ({ children, variant = "primary", size = "md", disabled = false, onClick, className = "" }) => {
  const baseClasses = "inline-flex items-center justify-center font-medium rounded-lg transition-colors duration-200"
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300",
    outline: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50",
    ghost: "text-gray-600 hover:bg-gray-100",
    secondary: "bg-gray-100 text-gray-700 hover:bg-gray-200"
  }
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base"
  }
  
  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

const Input = ({ placeholder, value, onChange, className = "" }) => (
  <input
    type="text"
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
  />
)

const Avatar = ({ src, name, size = "md", showOnlineStatus = false, isOnline = false }) => {
  const sizes = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12"
  }
  
  return (
    <div className="relative">
      <div className={`${sizes[size]} bg-gray-200 rounded-full flex items-center justify-center overflow-hidden`}>
        {src ? (
          <img src={src} alt={name} className="w-full h-full object-cover" />
        ) : (
          <User className="h-5 w-5 text-gray-500" />
        )}
      </div>
      {showOnlineStatus && (
        <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
          isOnline ? 'bg-green-500' : 'bg-gray-400'
        }`} />
      )}
    </div>
  )
}

const Badge = ({ children, variant = "primary", size = "md" }) => {
  const variants = {
    primary: "bg-blue-100 text-blue-800",
    success: "bg-green-100 text-green-800",
    warning: "bg-yellow-100 text-yellow-800",
    error: "bg-red-100 text-red-800",
    secondary: "bg-gray-100 text-gray-800",
    default: "bg-blue-600 text-white"
  }
  const sizes = {
    sm: "px-2 py-1 text-xs",
    md: "px-2.5 py-0.5 text-sm"
  }
  
  return (
    <span className={`inline-flex items-center font-medium rounded-full ${variants[variant]} ${sizes[size]}`}>
      {children}
    </span>
  )
}

const TypingIndicator = ({ userName }) => (
  <div className="flex items-start space-x-2 max-w-xs">
    <Avatar size="sm" name={userName} />
    <div className="bg-gray-100 rounded-lg px-4 py-2">
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      </div>
    </div>
  </div>
)

const ConnectionStatus = ({ isConnected }) => (
  <div className={`flex items-center space-x-1 text-xs ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
    {isConnected ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
    <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
  </div>
)

const formatRelativeTime = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now - date) / 1000)
  
  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  return `${Math.floor(diffInSeconds / 86400)}d ago`
}

const getAuthToken = () => {
  return window.localStorage?.getItem('auth_token') || window.sessionStorage?.getItem('auth_token')
}

const getCurrentUserId = () => {
  try {
    const userData = JSON.parse(window.localStorage?.getItem('user_data') || '{}')
    return userData.id || '1'
  } catch {
    return '1'
  }
}

const getCurrentUser = () => {
  try {
    const userData = JSON.parse(window.localStorage?.getItem('user_data') || '{}')
    return userData
  } catch {
    return { id: '1', name: 'User' }
  }
}

export function MessagesPage() {
  const [conversations, setConversations] = useState([])
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [sendingMessage, setSendingMessage] = useState(false)
  const [error, setError] = useState('')
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const [isWebSocketConnected, setIsWebSocketConnected] = useState(false)
  const [typingUsers, setTypingUsers] = useState(new Set())
  
  const messagesEndRef = useRef(null)
  const messagesContainerRef = useRef(null)
  const typingTimeoutRef = useRef(null)
  const echoRef = useRef(null)
  const channelRef = useRef(null)
  const currentUserId = getCurrentUserId()
  const currentUser = getCurrentUser()
  const previousMessagesLengthRef = useRef(0)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Initialize Echo
  useEffect(() => {
    if (!currentUser.id || echoRef.current) return

    console.log('🔌 Initializing Echo...')
    
    const config = {
      broadcaster: 'reverb',
      key: import.meta.env.VITE_REVERB_APP_KEY,
      wsHost: import.meta.env.VITE_REVERB_HOST || 'localhost',
      wsPort: import.meta.env.VITE_REVERB_PORT || 9001,
      wssPort: import.meta.env.VITE_REVERB_PORT || 9001,
      forceTLS: import.meta.env.VITE_REVERB_SCHEME === 'https',
      enabledTransports: ['ws', 'wss'],
      authEndpoint: `${import.meta.env.VITE_API_URL}/api/broadcasting/auth`,
      auth: {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      },
    }

    try {
      echoRef.current = new Echo(config)
      
      const pusher = echoRef.current.connector.pusher
      
      pusher.connection.bind('connected', () => {
        console.log('✅ WebSocket connected')
        setIsWebSocketConnected(true)
      })

      pusher.connection.bind('disconnected', () => {
        console.log('❌ WebSocket disconnected')
        setIsWebSocketConnected(false)
      })

      pusher.connection.bind('error', (error) => {
        console.error('❌ WebSocket error:', error)
      })
    } catch (error) {
      console.error('Failed to initialize Echo:', error)
    }

    return () => {
      if (echoRef.current) {
        echoRef.current.disconnect()
        echoRef.current = null
      }
    }
  }, [currentUser.id])

  // Setup channel listeners
  useEffect(() => {
    if (!selectedConversation || !echoRef.current) return

    const channelName = `conversation.${selectedConversation.id}`
    console.log(`🔔 Joining channel: ${channelName}`)

    // Leave previous channel
    if (channelRef.current) {
      echoRef.current.leave(channelRef.current)
    }

    const channel = echoRef.current.private(channelName)
    channelRef.current = channelName

    channel
      .subscribed(() => {
        console.log('✅ Subscribed to:', channelName)
      })
      .error((error) => {
        console.error('❌ Subscription error:', error)
      })
      .listen('.message.sent', (data) => {
        console.log('📨 MESSAGE RECEIVED:', data)
        
        if (data.conversation_id === selectedConversation.id) {
          setMessages(prev => {
            const exists = prev.find(msg => msg.id === data.id)
            if (exists) return prev
            return [...prev, {
              id: data.id,
              conversation_id: data.conversation_id,
              sender_id: data.sender_id,
              sender: data.sender,
              content: data.content,
              created_at: data.created_at
            }]
          })
        }

        setConversations(prev => 
          prev.map(conv => 
            conv.id === data.conversation_id 
              ? { 
                  ...conv, 
                  last_message: {
                    id: data.id,
                    content: data.content,
                    sender_id: data.sender_id,
                    created_at: data.created_at
                  },
                  updated_at: data.created_at
                }
              : conv
          )
        )
      })
      .listen('.user.typing', (data) => {
        console.log('⌨️ TYPING:', data)
        
        if (data.user_id !== parseInt(currentUserId)) {
          setTypingUsers(prev => {
            const newSet = new Set(prev)
            if (data.is_typing) {
              newSet.add(data.user_name)
              setTimeout(() => {
                setTypingUsers(p => {
                  const s = new Set(p)
                  s.delete(data.user_name)
                  return s
                })
              }, 3000)
            } else {
              newSet.delete(data.user_name)
            }
            return newSet
          })
        }
      })

    return () => {
      if (channelRef.current) {
        console.log('👋 Leaving channel:', channelRef.current)
        echoRef.current.leave(channelRef.current)
        channelRef.current = null
      }
    }
  }, [selectedConversation, currentUserId])

  useEffect(() => {
    fetchConversations()
  }, [])

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id)
    }
  }, [selectedConversation])

  useEffect(() => {
    // Only auto-scroll if:
    // 1. It's a new message (not initial load)
    // 2. User is near the bottom already
    const container = messagesContainerRef.current
    if (!container) return

    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100
    const hasNewMessage = messages.length > previousMessagesLengthRef.current

    if (hasNewMessage && isNearBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    previousMessagesLengthRef.current = messages.length
  }, [messages])

  const fetchConversations = async () => {
    try {
      setLoading(true)
      setError('')
      
      const apiUrl = import.meta.env?.VITE_API_URL || 'http://localhost:8000'
      const token = getAuthToken()

      if (!token) {
        setError('Please log in to view messages')
        return
      }

      const response = await fetch(`${apiUrl}/api/conversations`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        }
      })

      if (!response.ok) throw new Error('Failed to fetch conversations')

      const data = await response.json()
      
      if (data.success) {
        setConversations(data.data || [])
      } else {
        throw new Error(data.message || 'Failed to load conversations')
      }
    } catch (err) {
      console.error('Error fetching conversations:', err)
      setError(err.message)
      setConversations([])
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async (conversationId) => {
    try {
      setLoadingMessages(true)
      
      const apiUrl = import.meta.env?.VITE_API_URL || 'http://localhost:8000'
      const token = getAuthToken()

      const response = await fetch(`${apiUrl}/api/conversations/${conversationId}/messages`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        }
      })

      if (!response.ok) throw new Error('Failed to fetch messages')

      const data = await response.json()
      
      if (data.success) {
        setMessages(data.data || [])
      } else {
        throw new Error(data.message || 'Failed to load messages')
      }
    } catch (err) {
      console.error('Error fetching messages:', err)
      setMessages([])
    } finally {
      setLoadingMessages(false)
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || sendingMessage) return

    try {
      setSendingMessage(true)
      
      const apiUrl = import.meta.env?.VITE_API_URL || 'http://localhost:8000'
      const token = getAuthToken()

      const response = await fetch(`${apiUrl}/api/conversations/${selectedConversation.id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify({ content: newMessage.trim() })
      })

      if (!response.ok) throw new Error('Failed to send message')

      const data = await response.json()

      if (data.success) {
        setNewMessage('')
        
        if (!isWebSocketConnected) {
          setMessages(prev => [...prev, data.data])
          setConversations(prev => 
            prev.map(conv => 
              conv.id === selectedConversation.id 
                ? { ...conv, last_message: data.data, updated_at: data.data.created_at }
                : conv
            )
          )
        }
      } else {
        throw new Error(data.message || 'Failed to send message')
      }
    } catch (err) {
      console.error('Error sending message:', err)
      alert('Failed to send message. Please try again.')
    } finally {
      setSendingMessage(false)
    }
  }

  const handleTyping = useCallback(() => {
    if (!selectedConversation || !isWebSocketConnected) return

    const apiUrl = import.meta.env?.VITE_API_URL || 'http://localhost:8000'
    
    fetch(`${apiUrl}/api/conversations/${selectedConversation.id}/typing`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`,
        'Accept': 'application/json'
      },
      body: JSON.stringify({ is_typing: true })
    })

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)

    typingTimeoutRef.current = setTimeout(() => {
      fetch(`${apiUrl}/api/conversations/${selectedConversation.id}/typing`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify({ is_typing: false })
      })
    }, 1000)
  }, [selectedConversation, isWebSocketConnected])

  const handleInputChange = (e) => {
    setNewMessage(e.target.value)
    handleTyping()
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const getOtherParticipant = (conversation) => {
    if (!conversation) return null
    
    const isHost = conversation.host_id === parseInt(currentUserId)
    
    return isHost ? {
      id: conversation.renter_id,
      name: conversation.renter?.name || 'Renter',
      email: conversation.renter?.email || '',
      avatar: conversation.renter?.avatar || ''
    } : {
      id: conversation.host_id,
      name: conversation.host?.name || 'Host',
      email: conversation.host?.email || '',
      avatar: conversation.host?.avatar || ''
    }
  }

  const filteredConversations = conversations.filter(conv => {
    const otherParticipant = getOtherParticipant(conv)
    return otherParticipant?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
           conv.last_message?.content?.toLowerCase().includes(searchQuery.toLowerCase())
  })

  const renderConversationList = () => (
    <div className={`${isMobile && selectedConversation ? 'hidden' : 'flex'} flex-col w-full md:w-80 lg:w-96 border-r border-gray-200 bg-white h-full`}>
      <div className="p-4 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
          <ConnectionStatus isConnected={isWebSocketConnected} />
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="overflow-y-auto flex-1">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Loading...</span>
          </div>
        ) : error ? (
          <div className="p-4 text-center text-red-600">{error}</div>
        ) : filteredConversations.length === 0 ? (
          <div className="p-4 text-center text-gray-600">
            {searchQuery ? 'No conversations match your search' : 'No conversations yet'}
          </div>
        ) : (
          filteredConversations.map((conversation) => {
            const otherParticipant = getOtherParticipant(conversation)
            
            return (
              <div
                key={conversation.id}
                onClick={() => setSelectedConversation(conversation)}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedConversation?.id === conversation.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                }`}
              >
                <div className="flex items-start space-x-3">
                  <Avatar
                    src={otherParticipant?.avatar}
                    name={otherParticipant?.name || 'User'}
                    size="md"
                    showOnlineStatus
                    isOnline={false}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-medium text-gray-900 truncate">
                        {otherParticipant?.name || 'Unknown User'}
                      </h3>
                      <span className="text-xs text-gray-500 flex-shrink-0">
                        {formatRelativeTime(conversation.updated_at)}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600 truncate flex-1">
                        {conversation.last_message?.content || 'No messages yet'}
                      </p>
                      {conversation.unread_count > 0 && (
                        <Badge variant="default" size="sm" className="ml-2 flex-shrink-0">
                          {conversation.unread_count}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )

  const renderChatArea = () => {
    if (!selectedConversation) {
      return (
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
            <p className="text-gray-600">Choose a conversation from the list to start messaging</p>
          </div>
        </div>
      )
    }

    const otherParticipant = getOtherParticipant(selectedConversation)

    return (
      <div className={`${isMobile && selectedConversation ? 'flex' : 'hidden md:flex'} flex-col bg-white h-full flex-1`}>
        <div className="p-4 border-b border-gray-200 bg-white flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {isMobile && (
                <Button variant="ghost" size="sm" onClick={() => setSelectedConversation(null)} className="mr-2">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              )}
              <Avatar
                src={otherParticipant?.avatar}
                name={otherParticipant?.name || 'User'}
                size="md"
                showOnlineStatus
                isOnline={false}
              />
              <div>
                <h3 className="font-semibold text-gray-900">{otherParticipant?.name || 'Unknown User'}</h3>
                <p className="text-sm text-gray-600">Last seen recently</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm"><Phone className="h-4 w-4" /></Button>
              <Button variant="ghost" size="sm"><Video className="h-4 w-4" /></Button>
              <Button variant="ghost" size="sm"><Info className="h-4 w-4" /></Button>
              <Button variant="ghost" size="sm"><MoreVertical className="h-4 w-4" /></Button>
            </div>
          </div>
        </div>

        <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
          {loadingMessages ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">Loading messages...</span>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center text-gray-600 py-8">No messages yet. Start the conversation!</div>
          ) : (
            messages.map((message) => {
              const isOwnMessage = message.sender_id === parseInt(currentUserId)
              
              return (
                <div key={message.id} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex space-x-2 max-w-xs lg:max-w-md ${isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    <Avatar src={message.sender?.avatar} name={message.sender?.name || 'User'} size="sm" />
                    <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                      <div className={`px-4 py-2 rounded-lg ${isOwnMessage ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'}`}>
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      </div>
                      <span className="text-xs text-gray-500 mt-1">{formatRelativeTime(message.created_at)}</span>
                    </div>
                  </div>
                </div>
              )
            })
          )}
          
          {Array.from(typingUsers).map(userName => (
            <TypingIndicator key={userName} userName={userName} />
          ))}
          
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t border-gray-200 bg-white flex-shrink-0">
          <div className="flex items-end space-x-2">
            <Button variant="ghost" size="sm"><Paperclip className="h-4 w-4" /></Button>
            <div className="flex-1">
              <textarea
                value={newMessage}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={1}
                style={{ minHeight: '40px', maxHeight: '120px' }}
                disabled={sendingMessage}
              />
            </div>
            <Button variant="ghost" size="sm"><Smile className="h-4 w-4" /></Button>
            <Button onClick={handleSendMessage} disabled={!newMessage.trim() || sendingMessage} size="sm">
              {sendingMessage ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Messages</h1>
          <p className="text-gray-600">Communicate with hosts and guests</p>
        </div>

        <Card className="overflow-hidden" style={{ height: 'calc(100vh - 200px)' }}>
          <div className="flex h-full">
            {renderConversationList()}
            {renderChatArea()}
          </div>
        </Card>
      </div>
    </div>
  )
}