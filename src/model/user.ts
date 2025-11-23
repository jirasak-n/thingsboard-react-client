import { EntityId, BaseData } from './entity';

export interface UserId extends EntityId {
    entityType: 'USER';
}

export interface User extends BaseData<UserId> {
    tenantId?: EntityId;
    customerId?: EntityId;
    email: string;
    authority: 'SYS_ADMIN' | 'TENANT_ADMIN' | 'CUSTOMER_USER';
    firstName?: string;
    lastName?: string;
    additionalInfo?: any;
}
