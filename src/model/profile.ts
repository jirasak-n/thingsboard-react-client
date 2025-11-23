import { EntityId, BaseData } from './entity';

export interface DeviceProfileId extends EntityId {
    entityType: 'DEVICE_PROFILE';
}

export interface DeviceProfile extends BaseData<DeviceProfileId> {
    tenantId?: EntityId;
    name: string;
    description?: string;
    isDefault: boolean;
    type: 'DEFAULT';
    transportType: 'DEFAULT' | 'MQTT' | 'COAP' | 'LWM2M' | 'SNMP';
    provisionType: 'DISABLED' | 'ALLOW_CREATE_NEW_DEVICES' | 'CHECK_PRE_PROVISIONED_DEVICES';
    profileData?: any;
}

export interface DeviceProfileInfo extends BaseData<DeviceProfileId> {
    tenantId?: EntityId;
    name: string;
    image?: string;
    type: 'DEFAULT';
    transportType: 'DEFAULT' | 'MQTT' | 'COAP' | 'LWM2M' | 'SNMP';
}

export interface AssetProfileId extends EntityId {
    entityType: 'ASSET_PROFILE';
}

export interface AssetProfile extends BaseData<AssetProfileId> {
    tenantId?: EntityId;
    name: string;
    description?: string;
    isDefault: boolean;
}

export interface AssetProfileInfo extends BaseData<AssetProfileId> {
    tenantId?: EntityId;
    name: string;
    image?: string;
}
