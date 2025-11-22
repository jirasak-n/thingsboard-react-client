import { ThingsboardClient } from '../ThingsboardClient';
import { EntityId } from '../model/entity';
import { PageData, PageLink, TimePageLink } from '../model/page';
import { EventInfo, EventFilter } from '../model/event';

export class EventService {
    private tbClient: ThingsboardClient;

    constructor(tbClient: ThingsboardClient) {
        this.tbClient = tbClient;
    }

    public async getEvents(
        entityId: EntityId,
        eventType: string,
        tenantId: string,
        pageLink: TimePageLink
    ): Promise<PageData<EventInfo>> {
        let url = `/api/events/${entityId.entityType}/${entityId.id}/${eventType}?tenantId=${tenantId}&pageSize=${pageLink.pageSize}&page=${pageLink.page}`;
        if (pageLink.textSearch) {
            url += `&textSearch=${pageLink.textSearch}`;
        }
        if (pageLink.sortOrder) {
            url += `&sortProperty=${pageLink.sortOrder.property}&sortOrder=${pageLink.sortOrder.direction}`;
        }
        if (pageLink.startTime) {
            url += `&startTime=${pageLink.startTime}`;
        }
        if (pageLink.endTime) {
            url += `&endTime=${pageLink.endTime}`;
        }
        return this.tbClient.get<PageData<EventInfo>>(url);
    }

    public async getEventsByFilter(
        entityId: EntityId,
        filter: EventFilter,
        pageLink: TimePageLink,
        tenantId?: string
    ): Promise<PageData<EventInfo>> {
        // Note: This API endpoint structure might vary by TB version.
        // Standard: /api/events/{entityType}/{entityId}?tenantId={tenantId}&...
        // With body filter usually POST /api/events/{entityType}/{entityId}/query ?
        
        // Let's stick to the standard GET with query params for now as implemented in getEvents.
        // If filter implies specific type, we use that.
        const tid = tenantId || this.tbClient.getAuthUser()?.tenantId;
        return this.getEvents(entityId, filter.eventType, tid!, pageLink);
    }
    
    // Helper to get debug events
    public async getDebugRuleNodeEvents(entityId: EntityId, pageLink: TimePageLink): Promise<PageData<EventInfo>> {
        const tenantId = this.tbClient.getAuthUser()?.tenantId;
        return this.getEvents(entityId, 'DEBUG_RULE_NODE', tenantId!, pageLink);
    }
}

