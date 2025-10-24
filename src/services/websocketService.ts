import { useNotificationStore } from "@/store/notificationStore"
import { useEscrowStore } from "@/store/escrowStore"

class WebSocketService {
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000

  connect(url: string) {
    try {
      this.ws = new WebSocket(url)
      
      this.ws.onopen = () => {
        console.log('WebSocket connected')
        this.reconnectAttempts = 0
        useNotificationStore.getState().addNotification({
          type: 'success',
          title: 'Connected',
          message: 'Real-time updates enabled'
        })
      }

      this.ws.onmessage = (event) => {
        const data = JSON.parse(event.data)
        this.handleMessage(data)
      }

      this.ws.onclose = () => {
        console.log('WebSocket disconnected')
        this.reconnect(url)
      }

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error)
      }
    } catch (error) {
      console.error('Failed to connect WebSocket:', error)
    }
  }

  private handleMessage(data: any) {
    const { updateEscrow } = useEscrowStore.getState()
    
    switch (data.type) {
      case 'escrow_update':
        updateEscrow(data.escrowId, data.updates)
        break
      case 'ai_verification':
        useNotificationStore.getState().addNotification({
          type: 'info',
          title: 'AI Verification',
          message: `Escrow ${data.escrowId} verification completed`
        })
        break
      case 'dispute_update':
        useNotificationStore.getState().addNotification({
          type: 'warning',
          title: 'Dispute Update',
          message: `Dispute status changed for escrow ${data.escrowId}`
        })
        break
    }
  }

  private reconnect(url: string) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      setTimeout(() => {
        this.reconnectAttempts++
        this.connect(url)
      }, this.reconnectDelay * this.reconnectAttempts)
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }

  send(data: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data))
    }
  }
}

export const websocketService = new WebSocketService()