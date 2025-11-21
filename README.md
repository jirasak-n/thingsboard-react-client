# Thingsboard React Client

A TypeScript/React client library for Thingsboard IoT Platform, ported from the official [Dart Thingsboard Client](https://github.com/thingsboard/flutter_thingsboard/tree/master/dart_thingsboard_client).

This library provides a set of services and React hooks to interact with Thingsboard REST API and WebSocket API efficiently.

## Features

- **Authentication:** JWT handling, auto-refresh token, OAuth2 support.
- **Real-time Telemetry:** WebSocket handling with automatic reconnection and subscription management.
- **React Hooks:** Ready-to-use hooks for Auth and Telemetry.
- **Typed Models:** Comprehensive TypeScript interfaces for Devices, Alarms, and more.
- **Services:** Device, Attribute, Alarm, OAuth2 services implemented.

## Installation

(Assuming this package is published or linked locally)

```bash
npm install thingsboard-react-client
# or
yarn add thingsboard-react-client
```

## Getting Started

### 1. Setup Provider

Wrap your application with `ThingsboardProvider` to initialize the client and manage authentication state.

```tsx
import React from 'react';
import { ThingsboardProvider } from 'thingsboard-react-client';
import App from './App';

const Root = () => (
  <ThingsboardProvider apiEndpoint="http://localhost:8080">
    <App />
  </ThingsboardProvider>
);
```

### 2. Authentication

Use `useAuth` hook to handle login, logout, and check user status.

```tsx
import { useAuth } from 'thingsboard-react-client';

const LoginPage = () => {
  const { login, isLoading } = useAuth();

  const handleLogin = async () => {
    try {
      await login({ username: 'tenant@thingsboard.org', password: 'password' });
      // Redirect or handle success
    } catch (error) {
      console.error('Login failed', error);
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return <button onClick={handleLogin}>Login</button>;
};
```

### 3. Real-time Telemetry

Use `useTelemetry` hook to subscribe to real-time data. The hook handles subscription and unsubscription automatically.

```tsx
import { useTelemetry } from 'thingsboard-react-client';

const DeviceTemp = ({ deviceId }) => {
  useTelemetry({
    entityId: { entityType: 'DEVICE', id: deviceId },
    keys: ['temperature', 'humidity'],
    onData: (data) => {
      console.log('Received data:', data);
      // Update state here
    }
  });

  return <div>Listening for temperature...</div>;
};
```

### 4. Using Services

Access services directly via `useThingsboard` hook.

```tsx
import { useThingsboard } from 'thingsboard-react-client';
import { useEffect, useState } from 'react';

const DeviceList = () => {
  const tbClient = useThingsboard();
  const [devices, setDevices] = useState([]);

  useEffect(() => {
    const fetchDevices = async () => {
      const deviceService = tbClient.getDeviceService();
      const tenantDevices = await deviceService.getTenantDevice('My Device'); // Example method
      // Note: Use getTenantDevices for pagination list
    };
    fetchDevices();
  }, [tbClient]);

  return <div>...</div>;
};
```

## Implemented Services & Features

- [x] **Core:** Authentication, JWT Refresh, Axios Interceptors
- [x] **DeviceService:** CRUD, Credentials
- [x] **AttributeService:** Get/Save/Delete Attributes (Client/Server/Shared)
- [x] **TelemetryWebsocketService:** Real-time data subscription
- [x] **OAuth2Service:** Login processing, Config, Template management
- [x] **AlarmService:** CRUD, Ack, Clear, Assign, Query (V1/V2)

## Roadmap & Pending Features

The following services are planned for future implementation:

### User & Entity Management
- [ ] **UserService:** Manage users (create, delete, activate)
- [ ] **CustomerService:** Manage customer hierarchy
- [ ] **TenantService:** Manage tenants (SysAdmin)
- [ ] **AssetService:** Manage assets and profiles
- [ ] **EntityRelationService:** Manage entity relations

### UI & Visualization
- [ ] **DashboardService:** Manage dashboards
- [ ] **WidgetService:** Manage widget bundles
- [ ] **EntityViewService:** Manage entity views

### System & Operations
- [ ] **AdminService:** System settings, mail server
- [ ] **AuditLogService:** User action logs
- [ ] **EventService:** System events
- [ ] **OtaPackageService:** Firmware updates
- [ ] **EdgeService:** Edge management
- [ ] **RuleChainService:** Rule engine management

## Project Structure

```
src/
  ├── hooks/           # React Context & Hooks (useAuth, useTelemetry)
  ├── http/            # HTTP utilities
  ├── model/           # TypeScript Interfaces (Device, Alarm, etc.)
  ├── service/         # Business Logic Classes (DeviceService, AlarmService)
  ├── ThingsboardClient.ts  # Main Entry Point
  └── index.ts         # Public API Export
```

