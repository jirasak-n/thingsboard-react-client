import { EntityId, BaseData } from './entity';

export interface AssetId extends EntityId {
    entityType: 'ASSET';
}

export interface Asset extends BaseData<AssetId> {
    tenantId?: EntityId;
    customerId?: EntityId;
    name: string;
    type: string;
    label?: string;
    additionalInfo?: any;
}

export interface AssetInfo extends Asset {
    customerTitle?: string;
    customerIsPublic?: boolean;
}
