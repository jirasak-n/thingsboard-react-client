import { ThingsboardClient } from '../ThingsboardClient';
import { Device, DeviceCredentials } from '../model/device';
import { EntityId } from '../model/entity';

export class DeviceService {
    private tbClient: ThingsboardClient;

    constructor(tbClient: ThingsboardClient) {
        this.tbClient = tbClient;
    }

    public async getDevice(deviceId: string): Promise<Device> {
        return this.tbClient.get<Device>(`/api/device/${deviceId}`);
    }

    public async saveDevice(device: Device): Promise<Device> {
        return this.tbClient.post<Device>('/api/device', device);
    }

    public async deleteDevice(deviceId: string): Promise<void> {
        return this.tbClient.delete(`/api/device/${deviceId}`);
    }

    public async getTenantDevice(deviceName: string): Promise<Device> {
        return this.tbClient.get<Device>(`/api/tenant/devices?deviceName=${deviceName}`);
    }

    public async getDeviceCredentialsByDeviceId(deviceId: string): Promise<DeviceCredentials> {
        return this.tbClient.get<DeviceCredentials>(`/api/device/${deviceId}/credentials`);
    }

    public async updateDeviceCredentials(deviceCredentials: DeviceCredentials): Promise<DeviceCredentials> {
        return this.tbClient.post<DeviceCredentials>('/api/device/credentials', deviceCredentials);
    }
}

