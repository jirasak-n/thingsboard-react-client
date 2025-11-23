import { EntityId, BaseData } from './entity';

export interface DashboardId extends EntityId {
    entityType: 'DASHBOARD';
}

export interface Dashboard extends BaseData<DashboardId> {
    tenantId?: EntityId;
    title: string;
    image?: string;
    assignedCustomers?: any[];
    mobileHide?: boolean;
    mobileOrder?: number;
    configuration?: any;
}

export interface DashboardInfo extends Dashboard {
    // Info specific fields if any
}
