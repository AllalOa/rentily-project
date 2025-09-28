// services/websocketService.js
import Echo from 'laravel-echo'
import Pusher from 'pusher-js'

class WebSocketService {
  constructor() {
    this.echo = null
    this.isConnected = false
    this.currentUser = null
    this.listeners = new Map()
  }

  // Initialize connection
  connect(user) {
    if (this.isConnected && this.currentUser?.id === user.id) {
      return this.echo
    }

    this.currentUser = user
    
    // Configure Pusher
    window.Pusher = Pusher

    // Get configuration from environment
    const config = {
      broadcaster: 'reverb',
      key: import.meta.env.VITE_REVERB_APP_KEY,
      wsHost: import.meta.env.VITE_REVERB_HOST || 'localhost',
      wsPort: import.meta.env.VITE_REVERB_PORT || 9001,
      wssPort: import.meta.env.VITE_REVERB_PORT || 9001,
      forceTLS: import.meta.env.VITE_REVERB_SCHEME === 'https',
      enabledTransports: ['ws', 'wss'],
      auth: {
        headers: {
          Authorization: `Bearer ${this.getAuthToken()}`,
        },
      },
    }

    console.log('WebSocket config:', config)

    // Initialize Echo
    this.echo = new Echo(config)

    // Set connection status
    this.isConnected = true

    // Listen for connection events
    this.echo.connector.pusher.connection.bind('connected', () => {
      console.log('WebSocket connected')
      this.isConnected = true
    })

    this.echo.connector.pusher.connection.bind('disconnected', () => {
      console.log('WebSocket disconnected')
      this.isConnected = false
    })

    this.echo.connector.pusher.connection.bind('error', (error) => {
      console.error('WebSocket error:', error)
      this.isConnected = false
    })

    return this.echo
  }

  // Listen to conversation channel
  joinConversation(conversationId, callbacks = {}) {
    if (!this.echo || !this.isConnected) {
      console.warn('WebSocket not connected')
      return
    }

    const channelName = `conversation.${conversationId}`
    
    // Leave previous channel if exists
    if (this.listeners.has(channelName)) {
      this.leaveConversation(conversationId)
    }

    console.log(`Joining conversation channel: ${channelName}`)

    const channel = this.echo.private(channelName)
    
    // Listen for new messages
    channel.listen('.message.sent', (data) => {
      console.log('New message received:', data)
      if (callbacks.onNewMessage) {
        callbacks.onNewMessage(data)
      }
    })

    // Listen for typing indicators
    channel.listen('.user.typing', (data) => {
      console.log('Typing indicator:', data)
      if (callbacks.onTyping) {
        callbacks.onTyping(data)
      }
    })

    // Store channel reference
    this.listeners.set(channelName, channel)

    return channel
  }

  // Leave conversation channel
  leaveConversation(conversationId) {
    const channelName = `conversation.${conversationId}`
    
    if (this.listeners.has(channelName)) {
      console.log(`Leaving conversation channel: ${channelName}`)
      this.echo.leaveChannel(channelName)
      this.listeners.delete(channelName)
    }
  }

  // Send typing indicator
  sendTypingIndicator(conversationId, isTyping) {
    if (!this.echo || !this.isConnected) {
      return
    }

    fetch(`${import.meta.env.VITE_API_URL}/api/conversations/${conversationId}/typing`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`,
        'Accept': 'application/json'
      },
      body: JSON.stringify({ is_typing: isTyping })
    }).catch(error => {
      console.error('Error sending typing indicator:', error)
    })
  }

  // Disconnect
  disconnect() {
    if (this.echo) {
      // Leave all channels
      this.listeners.forEach((channel, channelName) => {
        this.echo.leaveChannel(channelName)
      })
      this.listeners.clear()

      // Disconnect Echo
      this.echo.disconnect()
      this.echo = null
      this.isConnected = false
      this.currentUser = null
    }
  }

  // Get auth token
  getAuthToken() {
    return localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')
  }

  // Check if connected
  isWebSocketConnected() {
    return this.isConnected && this.echo !== null
  }

  // Reconnect if needed
  reconnect() {
    if (this.currentUser && !this.isConnected) {
      console.log('Reconnecting WebSocket...')
      this.connect(this.currentUser)
    }
  }
}

// Create singleton instance
export const websocketService = new WebSocketService()

// Auto-reconnect on visibility change
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    websocketService.reconnect()
  }
})

// Auto-reconnect on online
window.addEventListener('online', () => {
  websocketService.reconnect()
})

export default websocketService