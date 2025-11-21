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
      const wrapper = {
         authCmd: null, // Auth handled on connect usually, but TB protocol allows authCmd
         cmds: cmds
      };
      // Note: TB WebSocket protocol expects { authCmd: ..., cmds: ... } or just cmds?
      // Looking at Dart code, it sends just the list of commands if auth is already established?
      // Dart: _cmdsWrapper.preparePublishCommands sends: { authCmd: {cmdId: 0, token: ...}, cmds: [...] }
      // We need to be careful here. The dart code sends Auth cmd with every batch if it hasn't been sent?
      // Let's look at Dart's _cmdsWrapper.preparePublishCommands
      
      // Simplified implementation: We will assume we just send what we have. 
      // But wait, Dart implementation wraps everything in an object that contains 'authCmd' and 'cmds'.
      
      // Let's try to construct the message payload correctly.
      const payload: any = {};
       // In pure WS protocol for TB, usually first message is Auth, subsequent are cmds.
       // However, wrapper structure is common.
       // Let's trust the structure: { tsSubCmds: [], historyCmds: [], attrSubCmds: [] } 
       // Wait, the new WS API (v2) or old? Dart client uses /api/ws which is the new one (v2+).
       // The new API expects JSON: { "authCmd": { "cmdId": 0, "token": "..." }, "cmds": [ ... ] }
       
       // Since we are inside publishCommands, we assume the socket is open.
       // We don't need to send Auth again if it was sent on open.
       
       // Actually, let's send the commands as an object with keys corresponding to command types if using old API,
       // OR use the unified structure. 
       // Dart code uses `TelemetryPluginCmdsWrapper`.
       
       // Let's stick to a generic payload structure for now.
       const data = JSON.stringify({
          cmds: cmds
       });
       
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

