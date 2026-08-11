/**
 * 🔌 WebSocket Manager - Reusable WebSocket connection handler
 * Handles multiple data sources with auto-reconnection
 */

export interface WebSocketConfig {
  url: string;
  protocols?: string[];
  reconnectAttempts?: number;
  reconnectDelay?: number;
  pingInterval?: number;
}

export interface PriceData {
  symbol: string;
  price: number;
  bid?: number;
  ask?: number;
  volume?: number;
  timestamp: number;
  source: string;
}

export class WebSocketManager {
  private ws: WebSocket | null = null;
  private config: WebSocketConfig;
  private reconnectCount = 0;
  private isConnecting = false;
  private pingTimer?: NodeJS.Timeout;
  private onDataCallback?: (data: PriceData) => void;
  private onStatusCallback?: (status: 'connected' | 'connecting' | 'error') => void;

  constructor(config: WebSocketConfig) {
    this.config = {
      reconnectAttempts: 5,
      reconnectDelay: 1000,
      pingInterval: 30000,
      ...config,
    };
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isConnecting) {
        reject(new Error('Already connecting'));
        return;
      }

      this.isConnecting = true;
      this.updateStatus('connecting');

      try {
        this.ws = new WebSocket(this.config.url, this.config.protocols);

        this.ws.onopen = () => {
          console.log(`✅ WebSocket connected: ${this.config.url}`);
          this.isConnecting = false;
          this.reconnectCount = 0;
          this.updateStatus('connected');
          this.startPing();
          resolve();
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(event);
        };

        this.ws.onclose = () => {
          console.log(`❌ WebSocket closed: ${this.config.url}`);
          this.cleanup();
          this.attemptReconnect();
        };

        this.ws.onerror = (error) => {
          console.error(`🚨 WebSocket error:`, error);
          this.updateStatus('error');
          this.isConnecting = false;
          reject(error);
        };

      } catch (error) {
        this.isConnecting = false;
        this.updateStatus('error');
        reject(error);
      }
    });
  }

  private handleMessage(event: MessageEvent) {
    try {
      const data = JSON.parse(event.data);
      const priceData = this.parsePriceData(data);
      if (priceData && this.onDataCallback) {
        this.onDataCallback(priceData);
      }
    } catch (error) {
      console.error('Message parse error:', error);
    }
  }

  private parsePriceData(data: any): PriceData | null {
    // Basic parser - will be extended per source
    if (data.s && data.p) {
      return {
        symbol: data.s,
        price: parseFloat(data.p),
        bid: data.b ? parseFloat(data.b) : undefined,
        ask: data.a ? parseFloat(data.a) : undefined,
        volume: data.v ? parseInt(data.v) : undefined,
        timestamp: Date.now(),
        source: this.getSourceName(),
      };
    }
    return null;
  }

  private getSourceName(): string {
    const url = new URL(this.config.url);
    return url.hostname.replace('ws.', '').replace('socket.', '');
  }

  private attemptReconnect() {
    if (this.reconnectCount >= (this.config.reconnectAttempts || 5)) {
      console.error('❌ Max reconnection attempts reached');
      this.updateStatus('error');
      return;
    }

    const delay = this.config.reconnectDelay! * Math.pow(2, this.reconnectCount);
    this.reconnectCount++;

    console.log(`🔄 Reconnecting in ${delay}ms (attempt ${this.reconnectCount})`);

    setTimeout(() => {
      this.connect().catch(() => {
        // Will retry again via onclose
      });
    }, delay);
  }

  private startPing() {
    if (this.config.pingInterval) {
      this.pingTimer = setInterval(() => {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
          this.ws.send(JSON.stringify({ type: 'ping' }));
        }
      }, this.config.pingInterval);
    }
  }

  private cleanup() {
    if (this.pingTimer) {
      clearInterval(this.pingTimer);
      this.pingTimer = undefined;
    }
  }

  private updateStatus(status: 'connected' | 'connecting' | 'error') {
    if (this.onStatusCallback) {
      this.onStatusCallback(status);
    }
  }

  // Public methods
  send(data: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  onData(callback: (data: PriceData) => void) {
    this.onDataCallback = callback;
  }

  onStatus(callback: (status: 'connected' | 'connecting' | 'error') => void) {
    this.onStatusCallback = callback;
  }

  disconnect() {
    this.cleanup();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}