export enum EntityType {
    TENANT = 'TENANT',
    CUSTOMER = 'CUSTOMER',
    USER = 'USER',
    DASHBOARD = 'DASHBOARD',
    ASSET = 'ASSET',
    DEVICE = 'DEVICE',
    ALARM = 'ALARM',
    ENTITY_VIEW = 'ENTITY_VIEW',
}

export interface EntityId {
    entityType: EntityType | string;
    id: string;
}

export interface BaseData<T extends EntityId> {
    id?: T;
    createdTime?: number;
}

