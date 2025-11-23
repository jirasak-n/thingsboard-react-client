import { BaseData, EntityId } from './entity';

export interface AdditionalInfoBased<T extends EntityId> extends BaseData<T> {
    additionalInfo?: any;
}

export interface ContactBased<T extends EntityId> extends AdditionalInfoBased<T> {
    country?: string;
    state?: string;
    city?: string;
    address?: string;
    address2?: string;
    zip?: string;
    phone?: string;
    email?: string;
}
