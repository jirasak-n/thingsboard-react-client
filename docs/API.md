# ThingsBoard React Client - Complete API Documentation

**Version:** 0.1.1  
**Package:** `thingsboard-react-client`

---

## Table of Contents

1. [Installation](#installation)
2. [Getting Started](#getting-started)
3. [Authentication](#authentication)
4. [HTTP APIs](#http-apis)
   - [Device Service](#device-service)
   - [Asset Service](#asset-service)
   - [Customer Service](#customer-service)
   - [Dashboard Service](#dashboard-service)
   - [User Service](#user-service)
   - [Alarm Service](#alarm-service)
   - [Attribute Service](#attribute-service)
   - [Event Service](#event-service)
   - [Device Profile Service](#device-profile-service)
   - [Asset Profile Service](#asset-profile-service)
   - [Entity Query Service](#entity-query-service)
   - [OAuth2 Service](#oauth2-service)
5. [WebSocket APIs](#websocket-apis)
   - [Telemetry Service](#telemetry-service)
   - [Real-time Subscriptions](#real-time-subscriptions)
6. [Models](#models)
7. [Error Handling](#error-handling)
8. [Best Practices](#best-practices)

---

## Installation

```bash
npm install thingsboard-react-client
```

```bash
yarn add thingsboard-react-client
```

---

## Getting Started

### Basic Setup

```typescript
import { ThingsboardClient } from 'thingsboard-react-client';

//  Initialize client
const client = new ThingsboardClient('https://your-thingsboard-server.com');

// Login
await client.login({
  username: 'tenant@thingsboard.org',
  password: 'tenant'
});

// Use APIs
const devices = await client.getDeviceService().getTenantDevices({
  pageSize: 10,
  page: 0
});
```

### React Integration

```tsx
import { ThingsboardProvider, useAuth, useThingsboard } from 'thingsboard-react-client';

function App() {
  return (
    <ThingsboardProvider apiEndpoint="https://your-server.com">
      <YourApp />
    </ThingsboardProvider>
  );
}

function YourComponent() {
  const { isAuthenticated, login, logout } = useAuth();
  const client = useThingsboard();
  
  // Use client...
}
```

---

## Authentication

### Login

```typescript
const response = await client.login({
  username: 'user@example.com',
  password: 'password'
});
// Returns: { token: string, refreshToken: string }
```

### Logout

```typescript
await client.logout();
```

### Auto Token Refresh

Token refresh happens automatically when expired. Manual refresh:

```typescript
await client.refreshJwtToken();
```

### Get Current User

```typescript
const user = client.getAuthUser();
// Returns: AuthUser | null
```

### Check Token Status

```typescript
const token = client.getToken();
const isExpired = client.isTokenExpired(token);
```

---

## HTTP APIs

### Device Service

#### Get Tenant Devices

```typescript
const devices = await client.getDeviceService().getTenantDevices({
  pageSize: 10,
  page: 0,
  textSearch: 'sensor',  // Optional
  sortProperty: 'name',   // Optional
  sortOrder: 'ASC'        // Optional
});
// Returns: PageData<Device>
```

#### Get Device by ID

```typescript
const device = await client.getDeviceService().getDevice(deviceId);
// Returns: Device
```

#### Save Device

```typescript
const device = await client.getDeviceService().saveDevice({
  name: 'My Device',
  type: 'sensor',
  label: 'Temperature Sensor'
});
// Returns: Device
```

#### Delete Device

```typescript
await client.getDeviceService().deleteDevice(deviceId);
```

---

### Asset Service

#### Get Tenant Assets

```typescript
const assets = await client.getAssetService().getTenantAssets({
  pageSize: 10,
  page: 0,
  type: 'building',  // Optional
  textSearch: 'floor'  // Optional
});
// Returns: PageData<Asset>
```

#### Get Asset by ID

```typescript
const asset = await client.getAssetService().getAsset(assetId);
```

#### Save Asset

```typescript
const asset = await client.getAssetService().saveAsset({
  name: 'Building A',
  type: 'building',
  label: 'Main Office'
});
```

#### Delete Asset

```typescript
await client.getAssetService().deleteAsset(assetId);
```

#### Assign Asset to Customer

```typescript
await client.getAssetService().assignAssetToCustomer(customerId, assetId);
```

#### Unassign Asset from Customer

```typescript
await client.getAssetService().unassignAssetFromCustomer(assetId);
```

#### Make Asset Public

```typescript
await client.getAssetService().assignAssetToPublicCustomer(assetId);
```

#### Get Asset Types

```typescript
const types = await client.getAssetService().getAssetTypes();
// Returns: Array<EntitySubtype>
```

#### Find Assets by Query

```typescript
const result = await client.getAssetService().findByQuery({
  assetTypes: ['building', 'floor'],
  pageLink: {
    pageSize: 20,
    page: 0,
    textSearch: 'office'
  }
});
```

---

### Customer Service

#### Get Customer by ID

```typescript
const customer = await client.getCustomerService().getCustomer(customerId);
```

#### Get Customers

```typescript
const customers = await client.getCustomerService().getCustomers({
  pageSize: 10,
  page: 0
});
```

#### Save Customer

```typescript
const customer = await client.getCustomerService().saveCustomer({
  title: 'ACME Corp',
  email: 'contact@acme.com',
  phone: '+1234567890',
  country: 'US',
  city: 'New York'
});
```

#### Delete Customer

```typescript
await client.getCustomerService().deleteCustomer(customerId);
```

#### Get Short Customer Info

```typescript
const info = await client.getCustomerService().getShortCustomerInfo(customerId);
// Returns: ShortCustomerInfo
```

#### Get Customer Title

```typescript
const title = await client.getCustomerService().getCustomerTitle(customerId);
// Returns: string
```

#### Get Tenant Customer by Title

```typescript
const customer = await client.getCustomerService().getTenantCustomer('ACME Corp');
```

---

### Dashboard Service

#### Get Tenant Dashboards

```typescript
const dashboards = await client.getDashboardService().getTenantDashboards({
  pageSize: 10,
  page: 0
});
```

#### Get Dashboard by ID

```typescript
const dashboard = await client.getDashboardService().getDashboard(dashboardId);
```

#### Get Dashboard Info

```typescript
const info = await client.getDashboardService().getDashboardInfo(dashboardId);
```

#### Save Dashboard

```typescript
const dashboard = await client.getDashboardService().saveDashboard({
  title: 'My Dashboard',
  configuration: {
    widgets: {},
    states: {
      default: {
        name: 'Default',
        root: true,
        layouts: {}
      }
    }
  }
});
```

#### Delete Dashboard

```typescript
await client.getDashboardService().deleteDashboard(dashboardId);
```

#### Assign Dashboard to Customer

```typescript
await client.getDashboardService().assignDashboardToCustomer(customerId, dashboardId);
```

#### Unassign Dashboard from Customer

```typescript
await client.getDashboardService().unassignDashboardFromCustomer(customerId, dashboardId);
```

#### Make Dashboard Public

```typescript
const publicDashboard = await client.getDashboardService().makeDashboardPublic(dashboardId);
```

#### Make Dashboard Private

```typescript
await client.getDashboardService().makeDashboardPrivate(dashboardId);
```

#### Set Tenant Home Dashboard

```typescript
const dashboardInfo = await client.getDashboardService().getDashboardInfo(dashboardId);
await client.getDashboardService().setTenantHomeDashboardInfo(dashboardInfo);
```

#### Get Tenant Home Dashboard

```typescript
const homeInfo = await client.getDashboardService().getTenantHomeDashboardInfo();
```

#### Get Server Time

```typescript
const serverTime = await client.getDashboardService().getServerTime();
// Returns: number (timestamp)
```

#### Get Max Datapoints Limit

```typescript
const limit = await client.getDashboardService().getMaxDatapointsLimit();
// Returns: number
```

---

### User Service

#### Get Users

```typescript
const users = await client.getUserService().getUsers({
  pageSize: 10,
  page: 0
});
```

#### Get User by ID

```typescript
const user = await client.getUserService().getUser(userId);
```

#### Save User

```typescript
const user = await client.getUserService().saveUser({
  email: 'user@example.com',
  firstName: 'John',
  lastName: 'Doe',
  authority: 'CUSTOMER_USER',
  customerId: customerId  // For customer users
});
```

#### Delete User

```typescript
await client.getUserService().deleteUser(userId);
```

#### Get Tenant Admins

```typescript
// Note: Requires SYSTEM_ADMIN role
const admins = await client.getUserService().getTenantAdmins(tenantId, {
  pageSize: 10,
  page: 0
});
```

#### Get Customer Users

```typescript
const users = await client.getUserService().getCustomerUsers(customerId, {
  pageSize: 10,
  page: 0
});
```

#### Get Activation Link

```typescript
const link = await client.getUserService().getActivationLink(userId);
// Returns: string (activation URL)
```

#### Send Activation Email

```typescript
await client.getUserService().sendActivationEmail(userEmail);
```

#### Set User Credentials Enabled

```typescript
await client.getUserService().setUserCredentialsEnabled(userId, true);
```

---

### Alarm Service

#### Get Alarms

```typescript
const alarms = await client.getAlarmService().getAlarms(entityId, {
  pageSize: 10,
  page: 0,
  searchStatus: 'ACTIVE',
  status: 'CRITICAL_UNACK'
});
```

#### Get Alarm by ID

```typescript
const alarm = await client.getAlarmService().getAlarmInfo(alarmId);
```

#### Clear Alarm

```typescript
await client.getAlarmService().clearAlarm(alarmId);
```

#### Acknowledge Alarm

```typescript
await client.getAlarmService().ackAlarm(alarmId);
```

#### Delete Alarm

```typescript
await client.getAlarmService().deleteAlarm(alarmId);
```

#### Get Highest Alarm Severity

```typescript
const severity = await client.getAlarmService().getHighestAlarmSeverity(
  entityId,
  'ACTIVE',     // searchStatus
  'UNACK'       // status
);
// Returns: 'CRITICAL' | 'MAJOR' | 'MINOR' | 'WARNING' | 'INDETERMINATE'
```

---

### Attribute Service

#### Get Attributes

```typescript
const attributes = await client.getAttributeService().getAttributesByScope(
  entityId,
  'SERVER_SCOPE',  // or 'CLIENT_SCOPE', 'SHARED_SCOPE'
  'temperature,humidity'  // Optional: specific keys
);
```

#### Save Attributes

```typescript
await client.getAttributeService().saveEntityAttributes(
  entityId,
  'SERVER_SCOPE',
  {
    temperature: 25.5,
    humidity: 60,
    status: 'active'
  }
);
```

#### Delete Attributes

```typescript
await client.getAttributeService().deleteEntityAttributes(
  entityId,
  'SERVER_SCOPE',
  'oldAttribute,obsoleteData'
);
```

---

### Event Service

#### Get Events

```typescript
const events = await client.getEventService().getEvents(
  entityId,
  'STATS',  // eventType: 'STATS' | 'ERROR' | 'LC_EVENT' | 'DEBUG'
  tenantId,
  {
    pageSize: 100,
    page: 0,
    startTime: Date.now() - 86400000,  // Last 24 hours
    endTime: Date.now()
  }
);
```

#### Clear Events

```typescript
await client.getEventService().clearEvents(
  entityId,
  'ERROR',
  startTime,
  endTime
);
```

---

### Device Profile Service

#### Get Device Profiles

```typescript
const profiles = await client.getDeviceProfileService().getDeviceProfiles({
  pageSize: 10,
  page: 0
});
```

#### Get Device Profile by ID

```typescript
const profile = await client.getDeviceProfileService().getDeviceProfile(profileId);
```

#### Save Device Profile

```typescript
const profile = await client.getDeviceProfileService().saveDeviceProfile({
  name: 'Temperature Sensor Profile',
  type: 'DEFAULT',
  transportType: 'DEFAULT',
  provisionType: 'DISABLED',
  profileData: {
    configuration: { type: 'DEFAULT' },
    transportConfiguration: { type: 'DEFAULT' }
  }
});
```

#### Delete Device Profile

```typescript
await client.getDeviceProfileService().deleteDeviceProfile(profileId);
```

#### Set Default Device Profile

```typescript
await client.getDeviceProfileService().setDefaultDeviceProfile(profileId);
```

#### Get Default Device Profile Info

```typescript
const defaultProfile = await client.getDeviceProfileService().getDefaultDeviceProfileInfo();
```

#### Get Device Profile Attribute Keys

```typescript
const attrKeys = await client.getDeviceProfileService()
  .getDeviceProfileDevicesAttributesKeys(profileId);
// Returns: string[]
```

#### Get Device Profile Timeseries Keys

```typescript
const tsKeys = await client.getDeviceProfileService()
  .getDeviceProfileDevicesTimeseriesKeys(profileId);
// Returns: string[]
```

---

### Asset Profile Service

#### Get Asset Profiles

```typescript
const profiles = await client.getAssetProfileService().getAssetProfiles({
  pageSize: 10,
  page: 0
});
```

#### Get Asset Profile by ID

```typescript
const profile = await client.getAssetProfileService().getAssetProfile(profileId);
```

#### Save Asset Profile

```typescript
const profile = await client.getAssetProfileService().saveAssetProfile({
  name: 'Building Profile',
  isDefault: false
});
```

#### Delete Asset Profile

```typescript
await client.getAssetProfileService().deleteAssetProfile(profileId);
```

#### Set Default Asset Profile

```typescript
await client.getAssetProfileService().setDefaultAssetProfile(profileId);
```

---

### Entity Query Service

#### Find Entities by Query

```typescript
const result = await client.getEntityQueryService().findEntityDataByQuery({
  entityFilter: {
    type: 'entityType',
    entityType: 'DEVICE'
  },
  keyFilters: [],
  pageLink: {
    pageSize: 20,
    page: 0
  }
});
```

---

### OAuth2 Service

#### Get OAuth2 Clients

```typescript
const clients = await client.getOAuth2Service().getOAuth2Clients();
// Returns: OAuth2ClientInfo[]
```

#### Get OAuth2 Login URL

```typescript
const loginUrl = client.getOAuth2Service().getLoginUrl(
  'http://localhost:3000/oauth2/callback',
  clientRegistrationId
);
```

---

## WebSocket APIs

### Telemetry Service

The Telemetry Service provides real-time data subscriptions via WebSocket.

#### Subscribe to Telemetry

```typescript
const subscription: TelemetrySubscriber = {
  subscriptionCommands: [{
    entityId: deviceId,
    scope: 'LATEST_TELEMETRY',
    cmdId: 1,
    type: 'TIMESERIES',
    keys: 'temperature,humidity'
  }],
  onData: (message) => {
    console.log('Telemetry update:', message.data);
  },
  onReconnected: () => {
    console.log('WebSocket reconnected');
  }
};

client.getTelemetryService().subscribe(subscription);
```

#### Subscribe to Attributes

```typescript
const subscription: TelemetrySubscriber = {
  subscriptionCommands: [{
    entityId: deviceId,
    scope: 'CLIENT_SCOPE',
    cmdId: 2,
    type: 'ATTRIBUTES',
    keys: 'status,config'
  }],
  onData: (message) => {
    console.log('Attribute update:', message.data);
  }
};

client.getTelemetryService().subscribe(subscription);
```

#### Subscribe to Entity Data (Advanced)

```typescript
const subscription: TelemetrySubscriber = {
  subscriptionCommands: [{
    cmdId: 3,
    type: 'ENTITY_DATA',
    query: {
      entityFilter: {
        type: 'entityType',
        entityType: 'DEVICE'
      },
      pageLink: {
        pageSize: 10,
        page: 0
      },
      entityFields: [{
        type: 'ENTITY_FIELD',
        key: 'name'
      }],
      latestValues: [{
        type: 'ATTRIBUTE',
        key: 'active'
      }, {
        type: 'TIME_SERIES',
        key: 'temperature'
      }]
    }
  }],
  onData: (message) => {
    console.log('Entity data:', message.data);
  },
  onCmdUpdate: (message) => {
    console.log('Data update:', message);
  }
};

client.getTelemetryService().subscribe(subscription);
```

#### Subscribe to Alarms

```typescript
const subscription: TelemetrySubscriber = {
  subscriptionCommands: [{
    cmdId: 4,
    type: 'ALARM_DATA',
    query: {
      entityFilter: {
        type: 'entityType',
        entityType: 'DEVICE'
      },
      pageLink: {
        pageSize: 10,
        page: 0
      }
    }
  }],
  onData: (message) => {
    console.log('Alarm update:', message.data);
  }
};

client.getTelemetryService().subscribe(subscription);
```

#### Subscribe to Notifications

```typescript
const subscription: TelemetrySubscriber = {
  subscriptionCommands: [{
    cmdId: 5,
    type: 'NOTIFICATIONS',
    limit: 100
  }],
  onData: (message) => {
    console.log('New notification:', message.data);
  }
};

client.getTelemetryService().subscribe(subscription);
```

#### Unsubscribe

```typescript
client.getTelemetryService().unsubscribe(subscription);
```

#### Close WebSocket Connection

```typescript
client.getTelemetryService().close();
```

---

## Models

### Core Entity Types

```typescript
interface EntityId {
  id: string;
  entityType: EntityType;
}

type EntityType = 
  | 'DEVICE' 
  | 'ASSET' 
  | 'CUSTOMER' 
  | 'USER' 
  | 'DASHBOARD'
  | 'ALARM'
  | 'DEVICE_PROFILE'
  | 'ASSET_PROFILE';

interface BaseData<T extends EntityId> {
  id?: T;
  createdTime?: number;
}
```

### Device

```typescript
interface Device extends BaseData<DeviceId> {
  tenantId?: EntityId;
  customerId?: EntityId;
  name: string;
  type: string;
  label?: string;
  deviceProfileId?: DeviceProfileId;
  deviceData?: any;
  additionalInfo?: any;
}
```

### Asset

```typescript
interface Asset extends BaseData<AssetId> {
  tenantId?: EntityId;
  customerId?: EntityId;
  name: string;
  type: string;
  label?: string;
  assetProfileId?: AssetProfileId;
  additionalInfo?: any;
}
```

### Customer

```typescript
interface Customer extends ContactBased, BaseData<CustomerId> {
  tenantId?: EntityId;
  title: string;
}

interface ContactBased extends AdditionalInfoBased {
  country?: string;
  state?: string;
  city?: string;
  address?: string;
  address2?: string;
  zip?: string;
  phone?: string;
  email?: string;
}
```

### Dashboard

```typescript
interface Dashboard extends BaseData<DashboardId> {
  tenantId?: EntityId;
  title: string;
  image?: string;
  mobileHide?: boolean;
  mobileOrder?: number;
  configuration?: any;
  assignedCustomers?: ShortCustomerInfo[];
}
```

### Alarm

```typescript
interface Alarm extends BaseData<AlarmId> {
  tenantId?: EntityId;
  customerId?: EntityId;
  type: string;
  originator: EntityId;
  severity: AlarmSeverity;
  status: AlarmStatus;
  startTs: number;
  endTs: number;
  ackTs: number;
  clearTs: number;
  details?: any;
  propagate: boolean;
  propagateToOwner: boolean;
  propagateToTenant: boolean;
}

type AlarmSeverity = 
  | 'CRITICAL' 
  | 'MAJOR' 
  | 'MINOR' 
  | 'WARNING' 
  | 'INDETERMINATE';

type AlarmStatus = 
  | 'ACTIVE_UNACK' 
  | 'ACTIVE_ACK' 
  | 'CLEARED_UNACK' 
  | 'CLEARED_ACK';
```

### Pagination

```typescript
interface PageLink {
  pageSize: number;
  page: number;
  textSearch?: string;
  sortOrder?: 'ASC' | 'DESC';
  sortProperty?: string;
}

interface PageData<T> {
  data: T[];
  totalPages: number;
  totalElements: number;
  hasNext: boolean;
}
```

---

## Error Handling

### Try-Catch Pattern

```typescript
try {
  const device = await client.getDeviceService().getDevice(deviceId);
} catch (error: any) {
  if (error.response?.status === 404) {
    console.error('Device not found');
  } else if (error.response?.status === 403) {
    console.error('Permission denied');
  } else if (error.response?.status === 401) {
    console.error('Unauthorized - please login');
  } else {
    console.error('Unexpected error:', error.message);
  }
}
```

### Common HTTP Status Codes

- **200 OK**: Success
- **400 Bad Request**: Invalid request data
- **401 Unauthorized**: Not authenticated
- **403 Forbidden**: No permission
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server error

### WebSocket Error Handling

```typescript
const subscription: TelemetrySubscriber = {
  subscriptionCommands: [/* ... */],
  onData: (message) => {
    // Handle data
  },
  onError: (error) => {
    console.error('WebSocket error:', error);
  },
  onReconnected: () => {
    console.log('Reconnected - resubscribing...');
  }
};
```

---

## Best Practices

### 1. Initialize Once

```typescript
// ✅ Good - Single instance
const client = new ThingsboardClient('https://server.com');

// ❌ Bad - Multiple instances
function makeRequest() {
  const client = new ThingsboardClient('https://server.com');
  // ...
}
```

### 2. Handle Token Expiration

```typescript
// Token refresh is automatic, but you can listen to logout events
client.onUserLoggedOut(() => {
  // Redirect to login page
  window.location.href = '/login';
});
```

### 3. Use React Hooks

```tsx
function DeviceList() {
  const client = useThingsboard();
  const [devices, setDevices] = useState([]);

  useEffect(() => {
    client.getDeviceService()
      .getTenantDevices({ pageSize: 10, page: 0 })
      .then(setDevices);
  }, [client]);

  return <div>{/* render devices */}</div>;
}
```

### 4. Batch Operations

```typescript
// ✅ Good - Process in batches
const devices = await client.getDeviceService().getTenantDevices({
  pageSize: 100,
  page: 0
});

// ❌ Bad - Too many individual requests
for (let id of deviceIds) {
  await client.getDeviceService().getDevice(id);
}
```

### 5. Cleanup WebSocket Subscriptions

```typescript
useEffect(() => {
  const subscription = {
    subscriptionCommands: [/* ... */],
    onData: handleData
  };
  
  client.getTelemetryService().subscribe(subscription);
  
  return () => {
    // Cleanup on unmount
    client.getTelemetryService().unsubscribe(subscription);
  };
}, []);
```

### 6. Use Type Definitions

```typescript
import type { Device, PageData } from 'thingsboard-react-client';

const devices: PageData<Device> = await client.getDeviceService()
  .getTenantDevices({ pageSize: 10, page: 0 });
```

### 7. Environment Variables

```typescript
// .env
VITE_TB_API_URL=https://demo.thingsboard.io

// Usage
const client = new ThingsboardClient(import.meta.env.VITE_TB_API_URL);
```

---

## Support

- **npm:** https://www.npmjs.com/package/thingsboard-react-client
- **ThingsBoard Docs:** https://thingsboard.io/docs/
- **GitHub Issues:** Report bugs and request features

---

**License:** MIT  
**Author:** Jirasak Nopparat
