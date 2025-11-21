import { BaseData, EntityId } from './entity';

export interface DeviceId extends EntityId {
    entityType: 'DEVICE';
}

export interface Device extends BaseData<DeviceId> {
    tenantId?: EntityId;
    customerId?: EntityId;
    name: string;
    type: string;
    label?: string;
    deviceProfileId?: EntityId;
    additionalInfo?: any;
}

export interface DeviceCredentials {
    id?: EntityId;
    deviceId: DeviceId;
    credentialsType: 'ACCESS_TOKEN' | 'X509_CERTIFICATE' | 'MQTT_BASIC' | 'LWM2M_CREDENTIALS';
    credentialsId: string;
    credentialsValue?: string;
}

