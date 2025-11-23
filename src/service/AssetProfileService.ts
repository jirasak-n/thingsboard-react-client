import { ThingsboardClient } from '../ThingsboardClient';
import { AssetProfile, AssetProfileInfo } from '../model/profile';
import { PageData, PageLink } from '../model/page';

export class AssetProfileService {
    private tbClient: ThingsboardClient;

    constructor(tbClient: ThingsboardClient) {
        this.tbClient = tbClient;
    }

    public async getAssetProfiles(pageLink: PageLink): Promise<PageData<AssetProfile>> {
        let url = `/api/assetProfiles?pageSize=${pageLink.pageSize}&page=${pageLink.page}`;
        if (pageLink.textSearch) {
            url += `&textSearch=${pageLink.textSearch}`;
        }
        if (pageLink.sortOrder) {
            url += `&sortProperty=${pageLink.sortOrder.property}&sortOrder=${pageLink.sortOrder.direction}`;
        }
        return this.tbClient.get<PageData<AssetProfile>>(url);
    }

    public async getAssetProfileInfos(pageLink: PageLink): Promise<PageData<AssetProfileInfo>> {
        let url = `/api/assetProfileInfos?pageSize=${pageLink.pageSize}&page=${pageLink.page}`;
        if (pageLink.textSearch) {
            url += `&textSearch=${pageLink.textSearch}`;
        }
        if (pageLink.sortOrder) {
            url += `&sortProperty=${pageLink.sortOrder.property}&sortOrder=${pageLink.sortOrder.direction}`;
        }
        return this.tbClient.get<PageData<AssetProfileInfo>>(url);
    }
}
