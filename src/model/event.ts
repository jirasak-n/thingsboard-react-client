import { EntityId } from './entity';
import { PageLink, PageData } from './page';

export interface Event extends PageData<EventInfo> {}

export interface EventInfo {
    id: EntityId;
    createdTime: number;
    tenantId: EntityId;
    entityId: EntityId;
    serviceId: string;
    uid: string;
    type: string;
    body: any;
}

export interface EventFilter {
    eventType: string; // 'STATS', 'ERROR', 'LC_EVENT', 'DEBUG_RULE_NODE', 'DEBUG_RULE_CHAIN'
    server?: string;
    startTime?: number;
    endTime?: number;
}

export interface EventQuery {
    entityId: EntityId;
    pageLink: PageLink;
    eventType: string;
    tenantId?: EntityId;
}

