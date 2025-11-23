import { EntityId, BaseData } from './entity';

export interface CustomerId extends EntityId {
    entityType: 'CUSTOMER';
}

export interface Customer extends BaseData<CustomerId> {
    tenantId?: EntityId;
    title: string;
    email?: string;
    phone?: string;
    country?: string;
    state?: string;
    city?: string;
    address?: string;
    address2?: string;
    zip?: string;
    additionalInfo?: any;
}
