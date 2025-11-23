import { EntityId } from './entity';

export enum EntitySearchDirection {
    FROM = 'FROM',
    TO = 'TO'
}

export interface RelationsSearchParameters {
    rootEntity: EntityId;
    direction: EntitySearchDirection;
    maxLevel: number;
    fetchLastLevelOnly: boolean;
}

export interface EntitySearchQuery {
    parameters: RelationsSearchParameters;
    relationType?: string;
}

export interface AssetSearchQuery extends EntitySearchQuery {
    assetTypes: string[];
}

export interface EntitySubtype {
    tenantId: EntityId;
    entityType: string;
    type: string;
}
