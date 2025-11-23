import { ThingsboardClient } from '../ThingsboardClient';
import { Asset, AssetInfo, AssetId } from '../model/asset';
import { PageData, PageLink } from '../model/page';

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

    public async getAssetsByIds(assetIds: string[]): Promise<Asset[]> {
        return this.tbClient.get<Asset[]>(`/api/assets?assetIds=${assetIds.join(',')}`);
    }
}
