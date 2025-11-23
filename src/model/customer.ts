import { EntityId, BaseData } from './entity';
import { ContactBased } from './contact';

export interface CustomerId extends EntityId {
    entityType: 'CUSTOMER';
}

export interface Customer extends ContactBased<CustomerId> {
    tenantId?: EntityId;
    title: string;
    externalId?: CustomerId;
}

export interface ShortCustomerInfo {
    customerId: CustomerId;
    title: string;
    isPublic: boolean;
}
