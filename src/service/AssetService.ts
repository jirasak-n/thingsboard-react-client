import { ThingsboardClient } from '../ThingsboardClient';
import { Asset, AssetInfo } from '../model/asset';
import { PageData, PageLink } from '../model/page';
import { AssetSearchQuery, EntitySubtype } from '../model/query';

export class AssetService {
    private tbClient: ThingsboardClient;

    constructor(tbClient: ThingsboardClient) {
        this.tbClient = tbClient;
    }

    public async getTenantAssetInfos(pageLink: PageLink, type?: string): Promise<PageData<AssetInfo>> {
        let url = `/api/tenant/assetInfos?pageSize=${pageLink.pageSize}&page=${pageLink.page}`;
        if (pageLink.textSearch) {
            url += `&textSearch=${pageLink.textSearch}`;
        }
        if (pageLink.sortOrder) {
            url += `&sortProperty=${pageLink.sortOrder.property}&sortOrder=${pageLink.sortOrder.direction}`;
        }
        if (type) {
            url += `&type=${type}`;
        }
        return this.tbClient.get<PageData<AssetInfo>>(url);
    }

    public async getCustomerAssetInfos(customerId: string, pageLink: PageLink, type?: string): Promise<PageData<AssetInfo>> {
        let url = `/api/customer/${customerId}/assetInfos?pageSize=${pageLink.pageSize}&page=${pageLink.page}`;
        if (pageLink.textSearch) {
            url += `&textSearch=${pageLink.textSearch}`;
        }
        if (pageLink.sortOrder) {
            url += `&sortProperty=${pageLink.sortOrder.property}&sortOrder=${pageLink.sortOrder.direction}`;
        }
        if (type) {
            url += `&type=${type}`;
        }
        return this.tbClient.get<PageData<AssetInfo>>(url);
    }

    public async getAsset(assetId: string): Promise<Asset | null> {
        return this.tbClient.get<Asset>(`/api/asset/${assetId}`);
    }

    public async getAssetInfo(assetId: string): Promise<AssetInfo | null> {
        return this.tbClient.get<AssetInfo>(`/api/asset/info/${assetId}`);
    }

    public async saveAsset(asset: Asset): Promise<Asset> {
        return this.tbClient.post<Asset>('/api/asset', asset);
    }

    public async deleteAsset(assetId: string): Promise<void> {
        return this.tbClient.delete(`/api/asset/${assetId}`);
    }

    public async assignAssetToCustomer(customerId: string, assetId: string): Promise<Asset | null> {
        return this.tbClient.post<Asset>(`/api/customer/${customerId}/asset/${assetId}`);
    }

    public async unassignAssetFromCustomer(assetId: string): Promise<Asset | null> {
        return this.tbClient.delete<Asset>(`/api/customer/asset/${assetId}`);
    }

    public async assignAssetToPublicCustomer(assetId: string): Promise<Asset | null> {
        return this.tbClient.post<Asset>(`/api/customer/public/asset/${assetId}`);
    }

    public async getTenantAssets(pageLink: PageLink, type: string = ''): Promise<PageData<Asset>> {
        let url = `/api/tenant/assets?pageSize=${pageLink.pageSize}&page=${pageLink.page}&type=${type}`;
        if (pageLink.textSearch) {
            url += `&textSearch=${pageLink.textSearch}`;
        }
        if (pageLink.sortOrder) {
            url += `&sortProperty=${pageLink.sortOrder.property}&sortOrder=${pageLink.sortOrder.direction}`;
        }
        return this.tbClient.get<PageData<Asset>>(url);
    }

    public async getAssetsByIds(assetIds: string[]): Promise<Asset[]> {
        return this.tbClient.get<Asset[]>(`/api/assets?assetIds=${assetIds.join(',')}`);
    }

    public async findByQuery(query: AssetSearchQuery): Promise<Asset[]> {
        return this.tbClient.post<Asset[]>('/api/assets', query);
    }

    public async getAssetTypes(): Promise<EntitySubtype[]> {
        return this.tbClient.get<EntitySubtype[]>('/api/asset/types');
    }
}
