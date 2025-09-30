// src/services/websocketService.js - Fixed for Reverb/Pusher protocol
import Echo from 'laravel-echo'
import Pusher from 'pusher-js'

// Make Pusher available globally for Laravel Echo
window.Pusher = Pusher

class WebSocketService {
  constructor() {
    this.echo = null
    this.isConnected = false
    this.currentUser = null
    this.listeners = new Map()
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
    this.reconnectTimeout = null
  }

  connect(user) {
    if (this.isConnected && this.currentUser?.id === user.id) {
      console.log('WebSocket already connected for user:', user.id)
      return this.echo
    }

    console.log('Connecting WebSocket for user:', user)
    this.currentUser = user
    
    this.disconnect()
    
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
          Authorization: `Bearer ${this.getAuthToken()}`,
        },
      },
    }

    console.log('WebSocket config:', {
      ...config,
      auth: { headers: { Authorization: config.auth.headers.Authorization ? 'Present' : 'Missing' } }
    })

    try {
      this.echo = new Echo(config)
      this.setupConnectionHandlers()
      return this.echo
    } catch (error) {
      console.error('Failed to initialize Echo:', error)
      this.isConnected = false
      this.scheduleReconnect()
    }

    return this.echo
  }

  setupConnectionHandlers() {
    if (!this.echo || !this.echo.connector) {
      console.error('Echo or connector not available for event handlers')
      return
    }

    console.log('✅ Setting up connection handlers')

    const pusher = this.echo.connector.pusher
    
    if (!pusher) {
      console.error('Pusher instance not found')
      return
    }

    pusher.connection.bind('connected', () => {
      console.log('✅ Reverb WebSocket connected')
      this.isConnected = true
      this.reconnectAttempts = 0
      this.rejoinChannels()
    })

    pusher.connection.bind('disconnected', () => {
      console.log('❌ Reverb WebSocket disconnected')
      this.isConnected = false
    })

    pusher.connection.bind('failed', () => {
      console.error('❌ Reverb WebSocket connection failed')
      this.isConnected = false
      this.scheduleReconnect()
    })

    pusher.connection.bind('unavailable', () => {
      console.error('❌ Reverb WebSocket unavailable')
      this.isConnected = false
      this.scheduleReconnect()
    })

    pusher.connection.bind('error', (error) => {
      console.error('❌ Reverb WebSocket error:', error)
      
      if (error?.error?.data?.code === 4009) {
        console.error('WebSocket authentication failed')
        this.handleAuthError()
      }
    })

    this.isConnected = pusher.connection.state === 'connected'
    console.log('Initial connection status:', this.isConnected)
    console.log('Pusher connection state:', pusher.connection.state)
  }

  scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached')
      return
    }

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
    }

    const delay = Math.pow(2, this.reconnectAttempts) * 1000
    console.log(`Scheduling reconnect in ${delay}ms (attempt ${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`)
    
    this.reconnectTimeout = setTimeout(() => {
      this.reconnectAttempts++
      if (this.currentUser) {
        this.connect(this.currentUser)
      }
    }, delay)
  }

  handleAuthError() {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_data')
    sessionStorage.removeItem('auth_token')
    window.dispatchEvent(new CustomEvent('websocket-auth-failed'))
  }

  rejoinChannels() {
    console.log('Re-joining channels after reconnection')
    const channelNames = Array.from(this.listeners.keys())
    const currentListeners = new Map(this.listeners)
    
    this.listeners.clear()
    
    channelNames.forEach(channelName => {
      const conversationId = channelName.replace('conversation.', '')
      const callbacks = currentListeners.get(channelName)?.callbacks
      if (callbacks) {
        this.joinConversation(conversationId, callbacks)
      }
    })
  }

  joinConversation(conversationId, callbacks = {}) {
    if (!this.echo) {
      console.warn('❌ Echo not initialized, cannot join conversation')
      return null
    }

    const channelName = `conversation.${conversationId}`
    
    if (this.listeners.has(channelName)) {
      console.log('Leaving existing channel:', channelName)
      this.leaveConversation(conversationId)
    }

    console.log(`🔔 Joining conversation channel: ${channelName}`)

    try {
      const channel = this.echo.private(channelName)
      
      channel.subscribed(() => {
        console.log('✅ Successfully subscribed to channel:', channelName)
      })

      channel.error((error) => {
        console.error('❌ Channel subscription error:', channelName, error)
      })
      
      channel.listen('message.sent', (data) => {
        console.log('📨 New message received via WebSocket:', data)
        if (callbacks.onNewMessage) {
          callbacks.onNewMessage(data)
        }
      })

      channel.listen('user.typing', (data) => {
        console.log('⌨️ Typing indicator received:', data)
        if (callbacks.onTyping) {
          callbacks.onTyping(data)
        }
      })

      this.listeners.set(channelName, { channel, callbacks })
      
      return channel
    } catch (error) {
      console.error('❌ Error joining conversation channel:', error)
      return null
    }
  }

  leaveConversation(conversationId) {
    const channelName = `conversation.${conversationId}`
    
    if (this.listeners.has(channelName)) {
      console.log(`👋 Leaving conversation channel: ${channelName}`)
      try {
        this.echo.leaveChannel(channelName)
        this.listeners.delete(channelName)
        console.log('✅ Successfully left channel:', channelName)
      } catch (error) {
        console.error('❌ Error leaving channel:', error)
      }
    }
  }

  async sendTypingIndicator(conversationId, isTyping) {
    if (!this.echo || !this.isConnected) {
      console.warn('❌ Cannot send typing indicator: WebSocket not connected')
      return false
    }

    console.log(`⌨️ Sending typing indicator: ${isTyping} for conversation ${conversationId}`)

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/conversations/${conversationId}/typing`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify({ is_typing: isTyping })
      })

      if (response.ok) {
        console.log('✅ Typing indicator sent successfully')
        return true
      } else {
        console.error('❌ Failed to send typing indicator:', response.status)
        return false
      }
    } catch (error) {
      console.error('❌ Error sending typing indicator:', error)
      return false
    }
  }

  disconnect() {
    console.log('🔌 Disconnecting WebSocket...')
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
      this.reconnectTimeout = null
    }
    
    if (this.echo) {
      this.listeners.forEach((_, channelName) => {
        console.log('👋 Leaving channel:', channelName)
        try {
          this.echo.leaveChannel(channelName)
        } catch (error) {
          console.warn('Error leaving channel:', channelName, error)
        }
      })
      this.listeners.clear()

      this.echo.disconnect()
      this.echo = null
      this.isConnected = false
      this.currentUser = null
      this.reconnectAttempts = 0
      console.log('✅ WebSocket disconnected')
    }
  }

  getAuthToken() {
    return localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')
  }

  isWebSocketConnected() {
    return this.isConnected && this.echo !== null
  }

  reconnect() {
    if (this.currentUser && !this.isConnected) {
      console.log('🔄 Manually reconnecting WebSocket...')
      this.connect(this.currentUser)
    }
  }

  getConnectionStatus() {
    return {
      connected: this.isConnected,
      hasEcho: !!this.echo,
      activeChannels: Array.from(this.listeners.keys()),
      reconnectAttempts: this.reconnectAttempts,
    }
  }
}

export const websocketService = new WebSocketService()

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    console.log('👁️ Page visible, checking WebSocket connection...')
    if (!websocketService.isWebSocketConnected()) {
      websocketService.reconnect()
    }
  }
})

window.addEventListener('online', () => {
  console.log('🌐 Back online, reconnecting WebSocket...')
  websocketService.reconnect()
})

window.addEventListener('websocket-auth-failed', () => {
  console.log('🔐 WebSocket authentication failed, redirecting to login...')
})

export default websocketService