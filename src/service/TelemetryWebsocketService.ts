import { ThingsboardClient } from '../ThingsboardClient';
import { TelemetrySubscriber, SubscriptionCmd, WebsocketDataMsg } from '../model/telemetry';

const RECONNECT_INTERVAL = 2000;
const WS_IDLE_TIMEOUT = 90000;

export class TelemetryWebsocketService {
  private isActive = false;
  private isOpening = false;
  private isOpened = false;
  private isReconnect = false;
  private socketCloseTimer: any = null;
  private reconnectTimer: any = null;
  private lastCmdId = 0;
  private subscribersMap = new Map<number, TelemetrySubscriber>();
  private reconnectSubscribers = new Set<TelemetrySubscriber>();
  private tbClient: ThingsboardClient;
  private telemetryUri: string;
  private socket: WebSocket | null = null;
  private cmdQueue: any[] = [];

  constructor(tbClient: ThingsboardClient) {
    this.tbClient = tbClient;
    const apiEndpoint = tbClient.getApiEndpoint();
    const protocol = apiEndpoint.startsWith('https') ? 'wss' : 'ws';
    const baseUrl = apiEndpoint.replace(/^https?:\/\//, '');
    this.telemetryUri = `${protocol}://${baseUrl}/api/ws`;
  }

  public subscribe(subscriber: TelemetrySubscriber) {
    this.isActive = true;
    subscriber.subscriptionCommands.forEach((cmd) => {
      const cmdId = this.nextCmdId();
      this.subscribersMap.set(cmdId, subscriber);
      cmd.cmdId = cmdId;
      this.cmdQueue.push(cmd);
    });
    this.publishCommands();
  }

  public unsubscribe(subscriber: TelemetrySubscriber) {
    if (this.isActive) {
      subscriber.subscriptionCommands.forEach((cmd) => {
        if (cmd.cmdId) {
          const unsubscribeCmd: SubscriptionCmd = {
            cmdId: cmd.cmdId,
            entityType: cmd.entityType,
            entityId: cmd.entityId,
            unsubscribe: true
          };
          this.cmdQueue.push(unsubscribeCmd);
          this.subscribersMap.delete(cmd.cmdId);
        }
      });
      this.reconnectSubscribers.delete(subscriber);
      this.publishCommands();
    }
  }

  private nextCmdId(): number {
    this.lastCmdId++;
    return this.lastCmdId;
  }

  private publishCommands() {
    while (this.isOpened && this.cmdQueue.length > 0) {
      // Send all pending commands
      const cmds = this.cmdQueue.splice(0, 10); // Batch 10 at a time
      
      // Construct payload in new V2/V3 format: { cmds: [ { type: '...', ... } ] }
      
      const payloadCmds = cmds.map(cmd => {
          const newCmd: any = { ...cmd };
          
          // Determine type if not present (though our SubscriptionCmd usually has it from hook)
          if (!newCmd.type) {
              // Fallback logic (should ideally be set by caller)
              if (cmd.keys && cmd.scope) {
                  // likely timeseries or attributes
                  newCmd.type = 'TIMESERIES'; // Default
              } else if (cmd.unsubscribe) {
                  // If original type missing, default to TIMESERIES as that's most common.
                  newCmd.type = 'TIMESERIES';
              }
          }
          return newCmd;
      });

      const payload = {
          cmds: payloadCmds
      };

      const data = JSON.stringify(payload);
      this.socket?.send(data);
    }
    this.tryOpenSocket();
  }

  private tryOpenSocket() {
    if (this.isActive) {
      if (!this.isOpened && !this.isOpening) {
        this.isOpening = true;
        const token = this.tbClient.getToken();
        if (token && !this.tbClient.isTokenExpired(token)) {
          this.openSocket(token);
        } else {
          this.tbClient.refreshJwtToken().then(() => {
             const newToken = this.tbClient.getToken();
             if (newToken) this.openSocket(newToken);
          }).catch(() => {
            this.isOpening = false;
            this.tbClient.logout();
          });
        }
      }
      if (this.socketCloseTimer) {
        clearTimeout(this.socketCloseTimer);
        this.socketCloseTimer = null;
      }
    }
  }

  private openSocket(token: string) {
    try {
      this.socket = new WebSocket(this.telemetryUri);
      
      this.socket.onopen = () => {
        this.onOpen(token);
      };

      this.socket.onmessage = (event) => {
        this.onMessage(event);
      };

      this.socket.onerror = (error) => {
        this.onError(error);
      };

      this.socket.onclose = (event) => {
        this.onClose(event);
      };

    } catch (e) {
      this.onClose(null);
    }
  }

  private onOpen(token: string) {
    this.isOpening = false;
    this.isOpened = true;
    
    // Authenticate immediately
    const authCmd = {
      authCmd: {
        cmdId: 0,
        token: token
      }
    };
    this.socket?.send(JSON.stringify(authCmd));

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.isReconnect) {
      this.isReconnect = false;
      this.reconnectSubscribers.forEach((sub) => {
        if (sub.onReconnected) sub.onReconnected();
        this.subscribe(sub);
      });
      this.reconnectSubscribers.clear();
    } else {
      this.publishCommands();
    }
  }

  private onMessage(event: MessageEvent) {
    try {
      const message: WebsocketDataMsg = JSON.parse(event.data);
      if (message.subscriptionId) {
        const subscriber = this.subscribersMap.get(message.subscriptionId);
        if (subscriber) {
          subscriber.onData(message);
        }
      } else if (message.cmdId) {
         const subscriber = this.subscribersMap.get(message.cmdId);
         if (subscriber) {
           subscriber.onData(message);
         }
      }
    } catch (e) {
      console.error('Failed to process websocket message', e);
    }
  }

  private onError(error: Event) {
    this.isOpening = false;
    console.error('WebSocket error:', error);
  }

  private onClose(event: CloseEvent | null) {
    this.isOpening = false;
    this.isOpened = false;
    if (this.isActive) {
       if (!this.isReconnect) {
         this.reconnectSubscribers.clear();
         this.subscribersMap.forEach((sub) => {
           this.reconnectSubscribers.add(sub);
         });
         // Reset state
         this.subscribersMap.clear();
         this.isReconnect = true;
       }
       
       if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
       this.reconnectTimer = setTimeout(() => this.tryOpenSocket(), RECONNECT_INTERVAL);
    }
  }
  
  public close() {
      this.isActive = false;
      if (this.socket) {
          this.socket.close();
      }
  }
}

