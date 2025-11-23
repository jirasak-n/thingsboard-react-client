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

    public async getDeviceProfile(deviceProfileId: string): Promise<DeviceProfile> {
        return this.tbClient.get<DeviceProfile>(`/api/deviceProfile/${deviceProfileId}`);
    }

    public async saveDeviceProfile(deviceProfile: DeviceProfile): Promise<DeviceProfile> {
        return this.tbClient.post<DeviceProfile>('/api/deviceProfile', deviceProfile);
    }

    public async deleteDeviceProfile(deviceProfileId: string): Promise<void> {
        return this.tbClient.delete(`/api/deviceProfile/${deviceProfileId}`);
    }

    public async setDefaultDeviceProfile(deviceProfileId: string): Promise<void> {
        return this.tbClient.post(`/api/deviceProfile/${deviceProfileId}/default`, {});
    }

    public async getDefaultDeviceProfileInfo(): Promise<DeviceProfileInfo> {
        return this.tbClient.get<DeviceProfileInfo>('/api/deviceProfileInfo/default');
    }

    public async getDeviceProfileInfo(deviceProfileId: string): Promise<DeviceProfileInfo> {
        return this.tbClient.get<DeviceProfileInfo>(`/api/deviceProfileInfo/${deviceProfileId}`);
    }

    public async getDeviceProfileDevicesAttributesKeys(deviceProfileId: string): Promise<Array<string>> {
        return this.tbClient.get<Array<string>>(`/api/deviceProfile/devices/keys/attributes?deviceProfileId=${deviceProfileId}`);
    }

    public async getDeviceProfileDevicesTimeseriesKeys(deviceProfileId: string): Promise<Array<string>> {
        return this.tbClient.get<Array<string>>(`/api/deviceProfile/devices/keys/timeseries?deviceProfileId=${deviceProfileId}`);
    }
}
