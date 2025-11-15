// Minimal websocket service stub for local dev
export const websocketService = {
  connect: async (url: string) => {
    // no-op connect for dev environment
    // In production this should create a real WebSocket connection
    // or delegate to a proper client implementation.
    // Keep it async to match expected usage in components.
    // eslint-disable-next-line no-console
    console.log('[websocketService] connect', url)
    return Promise.resolve()
  },
  disconnect: () => {
    // no-op disconnect
    // eslint-disable-next-line no-console
    console.log('[websocketService] disconnect')
  }
}
