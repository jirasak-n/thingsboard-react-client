export enum WsCmdType {
  AUTH = 'AUTH',
  ATTRIBUTES = 'ATTRIBUTES',
  TIMESERIES = 'TIMESERIES',
  TIMESERIES_HISTORY = 'TIMESERIES_HISTORY',
  ENTITY_DATA = 'ENTITY_DATA',
  ENTITY_COUNT = 'ENTITY_COUNT',
  ALARM_DATA = 'ALARM_DATA',
  ALARM_COUNT = 'ALARM_COUNT',
  NOTIFICATIONS = 'NOTIFICATIONS',
  NOTIFICATIONS_COUNT = 'NOTIFICATIONS_COUNT',
  MARK_NOTIFICATIONS_AS_READ = 'MARK_NOTIFICATIONS_AS_READ',
  MARK_ALL_NOTIFICATIONS_AS_READ = 'MARK_ALL_NOTIFICATIONS_AS_READ',
  
  ALARM_DATA_UNSUBSCRIBE = 'ALARM_DATA_UNSUBSCRIBE',
  ENTITY_DATA_UNSUBSCRIBE = 'ENTITY_DATA_UNSUBSCRIBE',
  ENTITY_COUNT_UNSUBSCRIBE = 'ENTITY_COUNT_UNSUBSCRIBE',
  NOTIFICATIONS_UNSUBSCRIBE = 'NOTIFICATIONS_UNSUBSCRIBE'
}

export interface WebsocketCmd {
  cmdId?: number;
  type: string; // WsCmdType
}

// --- Telemetry & Attributes (Existing but refined) ---

export interface SubscriptionCmd extends WebsocketCmd {
  entityType?: string;
  entityId?: string;
  keys?: string;
  scope?: string;
  unsubscribe?: boolean;
  // For Timeseries
  startTs?: number;
  timeWindow?: number;
  interval?: number;
  limit?: number;
  agg?: string;
}

// --- Entity Data Query Models ---

export interface EntityDataCmd extends WebsocketCmd {
  query?: EntityDataQuery;
  historyCmd?: EntityHistoryCmd;
  latestCmd?: LatestValueCmd;
  tsCmd?: TimeSeriesCmd;
}

export interface EntityDataQuery {
  entityFilter: EntityFilter;
  pageLink: EntityDataPageLink;
  entityFields?: EntityField[];
  latestValues?: EntityKey[];
  keyFilters?: KeyFilter[];
}

export interface EntityFilter {
  type: string; // 'SINGLE_ENTITY', 'ENTITY_LIST', 'ENTITY_NAME', 'DEVICE_TYPE', etc.
  singleEntity?: { entityType: string; id: string };
  entityType?: string;
  entityList?: string[];
  entityNameFilter?: string;
  deviceTypes?: string[];
  resolveMultiple?: boolean;
}

export interface EntityDataPageLink {
  pageSize: number;
  page: number;
  textSearch?: string;
  sortOrder?: EntityDataSortOrder;
  dynamic?: boolean;
}

export interface EntityDataSortOrder {
  key: string;
  direction: 'ASC' | 'DESC';
}

export interface EntityField {
  type: string;
  keyName: string;
}

export interface KeyFilter {
  key: string;
  valueType: string;
  value?: any;
  predicate?: any;
}

export interface EntityHistoryCmd {
  keys: string[];
  startTs: number;
  endTs: number;
  interval?: number;
  limit?: number;
  agg?: string;
}

export interface LatestValueCmd {
  keys: EntityKey[];
}

export interface TimeSeriesCmd {
  keys: string[];
  startTs: number;
  timeWindow: number;
  interval?: number;
  limit?: number;
  agg?: string;
}

export interface EntityKey {
  type: string;
  key: string;
}

// --- Entity Count Models ---

export interface EntityCountCmd extends WebsocketCmd {
  query?: EntityCountQuery;
}

export interface EntityCountQuery {
  entityFilter: EntityFilter;
  keyFilters?: KeyFilter[];
}

// --- Alarm Data Models ---

export interface AlarmDataCmd extends WebsocketCmd {
  query?: AlarmDataQuery;
}

export interface AlarmDataQuery {
  entityFilter?: EntityFilter;
  pageLink?: AlarmDataPageLink;
  alarmFields?: EntityField[];
}

export interface AlarmDataPageLink extends EntityDataPageLink {
  searchPropagatedAlarms?: boolean;
  status?: string;
  severityList?: string[];
  typeList?: string[];
}

// --- Notification Models ---

export interface NotificationsCmd extends WebsocketCmd {
  limit?: number; // For UnreadSubCmd
  notifications?: string[]; // For MarkAsReadCmd
}

// --- Updates / Responses ---

export interface WebsocketDataMsg {
  subscriptionId?: number;
  cmdId?: number;
  errorCode?: number;
  errorMsg?: string;
  
  // Telemetry/Attributes update
  data?: any;
  latestValues?: any;

  // Entity/Alarm Data update
  update?: any[];
  cmdUpdateType?: string; // 'ENTITY_DATA', 'ALARM_DATA', 'NOTIFICATIONS', etc.
  
  // Count updates
  count?: number;
  totalUnreadCount?: number;
  
  // Notifications
  notifications?: any[];
}

// Alias interfaces for specific updates to satisfy hooks
export interface EntityDataUpdate extends WebsocketDataMsg {}
export interface AlarmDataUpdate extends WebsocketDataMsg {}

export interface TelemetrySubscriber {
  subscriptionCommands: Array<SubscriptionCmd | EntityDataCmd | EntityCountCmd | AlarmDataCmd | NotificationsCmd | WebsocketCmd>;
  onData?: (data: WebsocketDataMsg) => void;
  onCmdUpdate?: (data: WebsocketDataMsg) => void; 
  onReconnected?: () => void;
}
