# ThingsBoard React Client

[![npm version](https://badge.fury.io/js/thingsboard-react-client.svg)](https://www.npmjs.com/package/thingsboard-react-client)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A comprehensive TypeScript/React client library for [ThingsBoard](https://thingsboard.io/) IoT Platform with full API coverage.

## Features

- 🚀 **Full API Coverage**: Complete implementation matching the official Dart client
- 🔐 **Authentication**: JWT-based authentication with automatic token management
- 📡 **WebSocket Support**: Real-time telemetry and notifications via WebSocket
- 🎯 **Type-Safe**: Written in TypeScript with comprehensive type definitions
- ⚛️ **React Hooks**: Ready-to-use React hooks for common operations
- 📦 **Tree-Shakeable**: Optimized bundle size with ES modules

## Installation

```bash
npm install thingsboard-react-client
```

or with yarn:

```bash
yarn add thingsboard-react-client
```

## Quick Start

### Basic Usage

```typescript
import { ThingsboardClient } from 'thingsboard-react-client';

// Initialize the client
const client = new ThingsboardClient({
  url: 'https://your-thingsboard-server.com'
});

// Login
await client.login({
  username: 'tenant@thingsboard.org',
  password: 'tenant'
});

// Use the API
const devices = await client.getDeviceService().getTenantDevices({
  pageSize: 10,
  page: 0
});

console.log('Devices:', devices);
```

### React Hook Example

```tsx
import { useThingsboard } from 'thingsboard-react-client';

function DeviceList() {
  const { client, isAuthenticated } = useThingsboard();
  const [devices, setDevices] = useState([]);

  useEffect(() => {
    if (isAuthenticated) {
      client.getDeviceService()
        .getTenantDevices({ pageSize: 10, page: 0 })
        .then(setDevices);
    }
  }, [isAuthenticated]);

  return (
    <div>
      {devices.map(device => (
        <div key={device.id.id}>{device.name}</div>
      ))}
    </div>
  );
}
```

### WebSocket Telemetry

```typescript
import { ThingsboardClient } from 'thingsboard-react-client';

const client = new ThingsboardClient({
  url: 'https://your-thingsboard-server.com'
});

await client.login({ username: 'user', password: 'pass' });

// Subscribe to telemetry updates
const subscription = client.getTelemetryService()
  .subscribeTelemetry({
    entityId: { entityType: 'DEVICE', id: 'device-id' },
    keys: ['temperature', 'humidity']
  });

subscription.subscribe({
  next: (data) => console.log('Telemetry:', data),
  error: (err) => console.error('Error:', err)
});
```

## API Coverage

This library provides full coverage of the ThingsBoard REST API:

- **🔐 Authentication**: Login, logout, user management
- **📱 Devices**: CRUD operations, telemetry, attributes
- **📊 Telemetry**: Real-time telemetry subscriptions via WebSocket
- **📦 Assets**: Asset management and relationships
- **👥 Customers**: Customer management
- **📈 Dashboards**: Dashboard CRUD and assignment
- **👤 Users**: User management and permissions
- **🔔 Alarms**: Alarm management and subscriptions
- **📝 Entity Views**: Entity view operations
- **⚙️ Device Profiles**: Device profile management
- **🏷️ Asset Profiles**: Asset profile management
- **🔗 Relations**: Entity relationship management

## Configuration

```typescript
const client = new ThingsboardClient({
  url: 'https://your-server.com',  // Required: ThingsBoard server URL
  retryCount: 3,                   // Optional: Number of retry attempts
  retryDelay: 1000,                // Optional: Delay between retries (ms)
  timeout: 30000                   // Optional: Request timeout (ms)
});
```

## Examples

### Create and Manage Devices

```typescript
// Create a device
const device = await client.getDeviceService().saveDevice({
  name: 'My Device',
  type: 'sensor',
  label: 'Temperature Sensor'
});

// Send telemetry
await client.getTelemetryService().saveTelemetry({
  entityId: device.id,
  data: {
    temperature: 25.5,
    humidity: 60
  }
});

// Delete device
await client.getDeviceService().deleteDevice(device.id.id);
```

### Manage Assets

```typescript
// Create an asset
const asset = await client.getAssetService().saveAsset({
  name: 'Building A',
  type: 'building'
});

// Assign to customer
await client.getAssetService().assignAssetToCustomer(
  customerId,
  asset.id.id
);
```

### Dashboard Operations

```typescript
// Create dashboard
const dashboard = await client.getDashboardService().saveDashboard({
  title: 'My Dashboard',
  configuration: { widgets: {} }
});

// Set as home dashboard
await client.getDashboardService().setTenantHomeDashboardInfo(
  await client.getDashboardService().getDashboardInfo(dashboard.id.id)
);
```

## TypeScript Support

This library is written in TypeScript and provides comprehensive type definitions:

```typescript
import type {
  Device,
  Asset,
  Customer,
  Dashboard,
  User,
  Alarm,
  TelemetryData
} from 'thingsboard-react-client';
```

## Error Handling

```typescript
try {
  const device = await client.getDeviceService().getDevice(deviceId);
} catch (error) {
  if (error.response?.status === 404) {
    console.error('Device not found');
  } else if (error.response?.status === 403) {
    console.error('Permission denied');
  } else {
    console.error('Unexpected error:', error);
  }
}
```

## Development

```bash
# Install dependencies
npm install

# Build the library
npm run build

# Run tests
npm test
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT © [Your Name]

## Links

- [ThingsBoard Documentation](https://thingsboard.io/docs/)
- [GitHub Repository](https://github.com/yourusername/thingsboard-react-client)
- [npm Package](https://www.npmjs.com/package/thingsboard-react-client)
- [Issue Tracker](https://github.com/yourusername/thingsboard-react-client/issues)

## Support

If you have any questions or need help, please:
- Check the [ThingsBoard Documentation](https://thingsboard.io/docs/)
- Open an [issue on GitHub](https://github.com/yourusername/thingsboard-react-client/issues)
- Join the [ThingsBoard Community](https://groups.google.com/forum/#!forum/thingsboard)
