export enum CmdType {
  ATTRIBUTES = 'ATTRIBUTES',
  TIMESERIES = 'TIMESERIES',
}

export interface SubscriptionCmd {
  cmdId?: number;
  entityType: string;
  entityId: string;
  keys?: string;
  scope?: string;
  unsubscribe?: boolean;
  type?: string;
}

export interface TelemetrySubscriber {
  subscriptionCommands: SubscriptionCmd[];
  onData: (data: any) => void;
  onReconnected?: () => void;
}

export interface SubscriptionUpdate {
  subscriptionId: number;
  errorCode: number;
  errorMsg: string;
  data: any;
  latestValues: any;
}

export interface WebsocketDataMsg {
  subscriptionId?: number;
  cmdId?: number;
  errorCode?: number;
  errorMsg?: string;
  data?: any;
  latestValues?: any;
}

