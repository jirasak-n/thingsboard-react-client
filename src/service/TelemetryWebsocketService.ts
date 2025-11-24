import { ThingsboardClient } from '../ThingsboardClient';
import { TelemetrySubscriber, SubscriptionCmd, WebsocketDataMsg, WsCmdType, WebsocketCmd, ConnectionStatus } from '../model/telemetry';

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
    private status: ConnectionStatus = ConnectionStatus.DISCONNECTED;
    private statusListeners: Set<(status: ConnectionStatus) => void> = new Set();

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
        this.reconnectSubscribers.add(subscriber); // Track for reconnection
        this.reconnectSubscribers.add(subscriber); // Track for reconnection
        this.publishCommands();
    }

    public addStatusListener(listener: (status: ConnectionStatus) => void) {
        this.statusListeners.add(listener);
        listener(this.status);
    }

    public removeStatusListener(listener: (status: ConnectionStatus) => void) {
        this.statusListeners.delete(listener);
    }

    public getStatus(): ConnectionStatus {
        return this.status;
    }

    private setStatus(status: ConnectionStatus) {
        if (this.status !== status) {
            this.status = status;
            this.statusListeners.forEach(listener => listener(status));
        }
    }

    public unsubscribe(subscriber: TelemetrySubscriber) {
        if (this.isActive) {
            subscriber.subscriptionCommands.forEach((cmd) => {
                if (cmd.cmdId) {
                    let unsubscribeType = WsCmdType.ENTITY_DATA_UNSUBSCRIBE; // Default fallback

                    switch (cmd.type) {
                        case WsCmdType.ALARM_DATA:
                            unsubscribeType = WsCmdType.ALARM_DATA_UNSUBSCRIBE;
                            break;
                        case WsCmdType.ENTITY_COUNT:
                            unsubscribeType = WsCmdType.ENTITY_COUNT_UNSUBSCRIBE;
                            break;
                        case WsCmdType.NOTIFICATIONS:
                            unsubscribeType = WsCmdType.NOTIFICATIONS_UNSUBSCRIBE;
                            break;
                        case WsCmdType.ATTRIBUTES:
                        case WsCmdType.TIMESERIES:
                            const tsUnsubCmd: SubscriptionCmd = {
                                ...cmd,
                                unsubscribe: true
                            };
                            this.cmdQueue.push(tsUnsubCmd);
                            this.subscribersMap.delete(cmd.cmdId);
                            return;
                    }

                    const unsubscribeCmd: WebsocketCmd = {
                        cmdId: cmd.cmdId,
                        type: unsubscribeType
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
            const cmds = this.cmdQueue.splice(0, 10);

            const payloadCmds = cmds.map(cmd => {
                const newCmd: any = { ...cmd };
                if (!newCmd.type) {
                    if (cmd.keys && cmd.scope) {
                        newCmd.type = WsCmdType.TIMESERIES;
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
                this.setStatus(ConnectionStatus.CONNECTING);
                const token = this.tbClient.getToken();
                if (token && !this.tbClient.isTokenExpired(token)) {
                    this.openSocket(token);
                } else {
                    this.tbClient.refreshJwtToken().then(() => {
                        const newToken = this.tbClient.getToken();
                        if (newToken) this.openSocket(newToken);
                    }).catch(() => {
                        this.isOpening = false;
                        this.setStatus(ConnectionStatus.DISCONNECTED);
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
        this.setStatus(ConnectionStatus.CONNECTED);

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

            // Copy current subscribers to a temp set to avoid modification issues during iteration
            const subscribersToReconnect = new Set(this.reconnectSubscribers);

            // Clear the main set immediately. 
            // As we call subscribe() for each item, they will be added back to reconnectSubscribers correctly.
            this.reconnectSubscribers.clear();

            subscribersToReconnect.forEach((sub) => {
                if (sub.onReconnected) sub.onReconnected();
                this.subscribe(sub);
            });
        } else {
            this.publishCommands();
        }
    }

    private onMessage(event: MessageEvent) {
        try {
            const message: WebsocketDataMsg = JSON.parse(event.data);

            // Critical Error Handling
            if (message.errorCode && (message.errorCode === 1 || message.errorCode === 2)) {
                console.warn(`WebSocket Critical Error (${message.errorCode}): ${message.errorMsg}. Forcing Reconnect...`);
                this.onClose(null);
                if (this.socket) this.socket.close();
                return;
            }

            let subscriber: TelemetrySubscriber | undefined;

            if (message.subscriptionId) {
                subscriber = this.subscribersMap.get(message.subscriptionId);
            } else if (message.cmdId) {
                subscriber = this.subscribersMap.get(message.cmdId);
            }

            if (subscriber) {
                if (message.cmdUpdateType) {
                    if (subscriber.onCmdUpdate) {
                        subscriber.onCmdUpdate(message);
                    }
                } else {
                    if (subscriber.onData) {
                        subscriber.onData(message);
                    }
                }
            }
        } catch (e) {
            console.error('Failed to process websocket message', e);
        }
    }

    private onError(error: Event) {
        this.isOpening = false;
        this.setStatus(ConnectionStatus.ERROR);
        console.error('WebSocket error:', error);
    }

    private onClose(event: CloseEvent | null) {
        this.isOpening = false;
        this.isOpened = false;
        if (this.isActive) {
            if (!this.isReconnect) {
                // Prepare for reconnect
                // Move all current subscribers to reconnect list (if not already there)
                this.subscribersMap.forEach((sub) => {
                    this.reconnectSubscribers.add(sub);
                });

                // Clear active map as old IDs are invalid in new session
                this.subscribersMap.clear();

                this.isReconnect = true;
                this.setStatus(ConnectionStatus.RECONNECTING);
            }

            if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
            this.reconnectTimer = setTimeout(() => this.tryOpenSocket(), RECONNECT_INTERVAL);
        }
    }

    public close() {
        this.isActive = false;
        this.setStatus(ConnectionStatus.DISCONNECTED);
        if (this.socket) {
            this.socket.close();
        }
        if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
        if (this.socketCloseTimer) clearTimeout(this.socketCloseTimer);
    }
}
