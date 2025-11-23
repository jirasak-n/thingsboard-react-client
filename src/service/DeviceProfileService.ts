import { ThingsboardClient } from '../ThingsboardClient';
import { DeviceProfile, DeviceProfileInfo } from '../model/profile';
import { PageData, PageLink } from '../model/page';

export class DeviceProfileService {
    private tbClient: ThingsboardClient;

    constructor(tbClient: ThingsboardClient) {
        this.tbClient = tbClient;
    }

    public async getDeviceProfiles(pageLink: PageLink): Promise<PageData<DeviceProfile>> {
        let url = `/api/deviceProfiles?pageSize=${pageLink.pageSize}&page=${pageLink.page}`;
        if (pageLink.textSearch) {
            url += `&textSearch=${pageLink.textSearch}`;
        }
        if (pageLink.sortOrder) {
            url += `&sortProperty=${pageLink.sortOrder.property}&sortOrder=${pageLink.sortOrder.direction}`;
        }
        return this.tbClient.get<PageData<DeviceProfile>>(url);
    }

    public async getDeviceProfileInfos(pageLink: PageLink): Promise<PageData<DeviceProfileInfo>> {
        let url = `/api/deviceProfileInfos?pageSize=${pageLink.pageSize}&page=${pageLink.page}`;
        if (pageLink.textSearch) {
            url += `&textSearch=${pageLink.textSearch}`;
        }
        if (pageLink.sortOrder) {
            url += `&sortProperty=${pageLink.sortOrder.property}&sortOrder=${pageLink.sortOrder.direction}`;
        }
        return this.tbClient.get<PageData<DeviceProfileInfo>>(url);
    }
}
