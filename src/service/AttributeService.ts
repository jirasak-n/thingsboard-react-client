import { ThingsboardClient } from '../ThingsboardClient';
import { EntityId } from '../model/entity';

export enum AttributeScope {
    CLIENT_SCOPE = 'CLIENT_SCOPE',
    SERVER_SCOPE = 'SERVER_SCOPE',
    SHARED_SCOPE = 'SHARED_SCOPE',
}

export interface AttributeData {
    lastUpdateTs: number;
    key: string;
    value: any;
}

export class AttributeService {
    private tbClient: ThingsboardClient;

    constructor(tbClient: ThingsboardClient) {
        this.tbClient = tbClient;
    }

    public async getAttributeKeys(entityId: EntityId): Promise<string[]> {
        return this.tbClient.get<string[]>(`/api/plugins/telemetry/${entityId.entityType}/${entityId.id}/keys/attributes`);
    }

    public async getAttributeKeysByScope(entityId: EntityId, scope: AttributeScope): Promise<string[]> {
        return this.tbClient.get<string[]>(`/api/plugins/telemetry/${entityId.entityType}/${entityId.id}/keys/attributes/${scope}`);
    }

    public async getAttributes(entityId: EntityId, keys?: string[]): Promise<AttributeData[]> {
        const keysParam = keys ? `?keys=${keys.join(',')}` : '';
        return this.tbClient.get<AttributeData[]>(`/api/plugins/telemetry/${entityId.entityType}/${entityId.id}/values/attributes${keysParam}`);
    }

    public async getAttributesByScope(entityId: EntityId, scope: AttributeScope, keys?: string[]): Promise<AttributeData[]> {
        const keysParam = keys ? `?keys=${keys.join(',')}` : '';
        return this.tbClient.get<AttributeData[]>(`/api/plugins/telemetry/${entityId.entityType}/${entityId.id}/values/attributes/${scope}${keysParam}`);
    }

    public async saveAttributes(entityId: EntityId, scope: AttributeScope, attributes: any): Promise<void> {
        return this.tbClient.post(`/api/plugins/telemetry/${entityId.entityType}/${entityId.id}/${scope}`, attributes);
    }
    
    public async saveEntityAttributesV2(entityId: EntityId, scope: AttributeScope, attributes: any): Promise<void> {
         return this.tbClient.post(`/api/plugins/telemetry/${entityId.entityType}/${entityId.id}/attributes/${scope}`, attributes);
    }

    public async deleteAttributes(entityId: EntityId, scope: AttributeScope, keys: string[]): Promise<void> {
        return this.tbClient.delete(`/api/plugins/telemetry/${entityId.entityType}/${entityId.id}/${scope}?keys=${keys.join(',')}`);
    }
}

