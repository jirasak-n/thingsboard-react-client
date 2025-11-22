import { ThingsboardClient } from '../ThingsboardClient';
import { EntityDataQuery, EntityDataPageLink, EntityCountQuery, AlarmDataQuery } from '../model/telemetry';
import { PageData } from '../model/page';
import { EntityId } from '../model/entity';

export class EntityQueryService {
    private tbClient: ThingsboardClient;

    constructor(tbClient: ThingsboardClient) {
        this.tbClient = tbClient;
    }

    public async countEntitiesByQuery(query: EntityCountQuery): Promise<number> {
        return this.tbClient.post<number>('/api/entitiesQuery/count', query);
    }

    public async findEntityDataByQuery(query: EntityDataQuery): Promise<PageData<any>> { // Returns EntityDataPageData
        return this.tbClient.post<PageData<any>>('/api/entitiesQuery/find', query);
    }

    public async findAlarmDataByQuery(query: AlarmDataQuery): Promise<PageData<any>> { // Returns AlarmDataPageData
        return this.tbClient.post<PageData<any>>('/api/alarmsQuery/find', query);
    }
    
    // Helper for finding entity ID by name
    public async findEntityIdByName(entityType: string, name: string): Promise<EntityId | null> {
        // This usually uses specific API like /api/device?deviceName=... or tenant/assets?assetName=...
        // But Generic Entity Query can do it too.
        // Let's stick to specific implementations in DeviceService/AssetService for simple lookups.
        // This service is for complex queries.
        return null; 
    }
}

