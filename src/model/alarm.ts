import { EntityId, BaseData, EntityType } from './entity';
import { TimePageLink, PageLink } from './page';

export enum AlarmSeverity {
    CRITICAL = 'CRITICAL',
    MAJOR = 'MAJOR',
    MINOR = 'MINOR',
    WARNING = 'WARNING',
    INDETERMINATE = 'INDETERMINATE'
}

export enum AlarmStatus {
    ACTIVE_UNACK = 'ACTIVE_UNACK',
    ACTIVE_ACK = 'ACTIVE_ACK',
    CLEARED_UNACK = 'CLEARED_UNACK',
    CLEARED_ACK = 'CLEARED_ACK'
}

export enum AlarmSearchStatus {
    ANY = 'ANY',
    ACTIVE = 'ACTIVE',
    CLEARED = 'CLEARED',
    ACK = 'ACK',
    UNACK = 'UNACK'
}

export interface AlarmId extends EntityId {
    entityType: 'ALARM';
}

export interface AlarmAssignee {
    id: EntityId; // UserId
    firstName?: string;
    lastName?: string;
    email: string;
}

export interface Alarm extends BaseData<AlarmId> {
    tenantId?: EntityId;
    customerId?: EntityId;
    type: string;
    originator: EntityId;
    severity: AlarmSeverity;
    status: AlarmStatus;
    acknowledged: boolean;
    cleared: boolean;
    assigneeId?: EntityId;
    startTs: number;
    endTs: number;
    ackTs: number;
    clearTs: number;
    assignTs: number;
    propagate: boolean;
    propagateToOwner: boolean;
    propagateToTenant: boolean;
    details?: any;
    name: string; // getName implementation
}

export interface AlarmInfo extends Alarm {
    originatorName?: string;
    originatorLabel?: string;
    assignee?: AlarmAssignee;
}

export interface AlarmQuery {
    affectedEntityId?: EntityId;
    pageLink: TimePageLink;
    searchStatus?: AlarmSearchStatus;
    status?: AlarmStatus;
    assigneeId?: EntityId;
    fetchOriginator?: boolean;
}

export interface AlarmQueryV2 {
    affectedEntityId?: EntityId;
    pageLink: TimePageLink;
    typeList?: string[];
    statusList?: AlarmSearchStatus[];
    severityList?: AlarmSeverity[];
    assigneeId?: EntityId;
}

