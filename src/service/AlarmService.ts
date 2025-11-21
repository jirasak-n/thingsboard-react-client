import { ThingsboardClient } from '../ThingsboardClient';
import { EntityId } from '../model/entity';
import { Alarm, AlarmInfo, AlarmQuery, AlarmQueryV2, AlarmSeverity, AlarmSearchStatus, AlarmStatus } from '../model/alarm';
import { PageData } from '../model/page';

export class AlarmService {
    private tbClient: ThingsboardClient;

    constructor(tbClient: ThingsboardClient) {
        this.tbClient = tbClient;
    }

    public async getAlarm(alarmId: string): Promise<Alarm | null> {
        try {
            return await this.tbClient.get<Alarm>(`/api/alarm/${alarmId}`);
        } catch (e: any) {
            if (e.response && e.response.status === 404) {
                return null;
            }
            throw e;
        }
    }

    public async getAlarmInfo(alarmId: string): Promise<AlarmInfo | null> {
        try {
            return await this.tbClient.get<AlarmInfo>(`/api/alarm/info/${alarmId}`);
        } catch (e: any) {
            if (e.response && e.response.status === 404) {
                return null;
            }
            throw e;
        }
    }

    public async saveAlarm(alarm: Alarm): Promise<Alarm> {
        return this.tbClient.post<Alarm>('/api/alarm', alarm);
    }

    public async ackAlarm(alarmId: string): Promise<AlarmInfo> {
        return this.tbClient.post<AlarmInfo>(`/api/alarm/${alarmId}/ack`);
    }

    public async clearAlarm(alarmId: string): Promise<AlarmInfo> {
        return this.tbClient.post<AlarmInfo>(`/api/alarm/${alarmId}/clear`);
    }

    public async deleteAlarm(alarmId: string): Promise<void> {
        return this.tbClient.delete(`/api/alarm/${alarmId}`);
    }

    public async assignAlarm(alarmId: string, assigneeId: string): Promise<AlarmInfo> {
        return this.tbClient.post<AlarmInfo>(`/api/alarm/${alarmId}/assign/${assigneeId}`);
    }

    public async unassignAlarm(alarmId: string): Promise<AlarmInfo> {
        return this.tbClient.delete<AlarmInfo>(`/api/alarm/${alarmId}/assign`);
    }

    public async getAlarms(query: AlarmQuery): Promise<PageData<AlarmInfo>> {
        const params = this.toAlarmQueryParams(query);
        return this.tbClient.get<PageData<AlarmInfo>>(
            `/api/alarm/${query.affectedEntityId!.entityType}/${query.affectedEntityId!.id}`,
            { params }
        );
    }

    public async getAllAlarms(query: AlarmQuery): Promise<PageData<AlarmInfo>> {
        const params = this.toAlarmQueryParams(query);
        return this.tbClient.get<PageData<AlarmInfo>>('/api/alarms', { params });
    }

    public async getAlarmsV2(query: AlarmQueryV2): Promise<PageData<AlarmInfo>> {
        const params = this.toAlarmQueryV2Params(query);
        return this.tbClient.get<PageData<AlarmInfo>>(
            `/api/v2/alarm/${query.affectedEntityId!.entityType}/${query.affectedEntityId!.id}`,
            { params }
        );
    }

    public async getAllAlarmsV2(query: AlarmQueryV2): Promise<PageData<AlarmInfo>> {
        const params = this.toAlarmQueryV2Params(query);
        return this.tbClient.get<PageData<AlarmInfo>>('/api/v2/alarms', { params });
    }

    public async getHighestAlarmSeverity(entityId: EntityId, searchStatus?: AlarmSearchStatus, status?: AlarmStatus): Promise<AlarmSeverity | null> {
        const params: any = {};
        if (searchStatus) {
            params.searchStatus = searchStatus;
        } else if (status) {
            params.status = status;
        }
        try {
             // Note: The API returns a plain string enum, not JSON object usually
            const response = await this.tbClient.get<string>(
                `/api/alarm/highestSeverity/${entityId.entityType}/${entityId.id}`, 
                { params }
            );
            // TS might interpret response as object if axios config is json, but here we expect string
            return response as unknown as AlarmSeverity;
        } catch (e) {
            return null;
        }
    }

    private toAlarmQueryParams(query: AlarmQuery): any {
        const params: any = {
            ...query.pageLink,
            pageSize: query.pageLink.pageSize,
            page: query.pageLink.page
        };
        if (query.pageLink.textSearch) params.textSearch = query.pageLink.textSearch;
        if (query.pageLink.sortOrder) {
            params.sortProperty = query.pageLink.sortOrder.property;
            params.sortOrder = query.pageLink.sortOrder.direction;
        }
        if (query.pageLink.startTime) params.startTime = query.pageLink.startTime;
        if (query.pageLink.endTime) params.endTime = query.pageLink.endTime;

        if (query.searchStatus) {
            params.searchStatus = query.searchStatus;
        } else if (query.status) {
            params.status = query.status;
        }
        if (query.assigneeId) {
            params.assigneeId = query.assigneeId.id;
        }
        if (query.fetchOriginator !== undefined) {
            params.fetchOriginator = query.fetchOriginator;
        }
        return params;
    }

    private toAlarmQueryV2Params(query: AlarmQueryV2): any {
        const params: any = {
            pageSize: query.pageLink.pageSize,
            page: query.pageLink.page
        };
        if (query.pageLink.textSearch) params.textSearch = query.pageLink.textSearch;
        if (query.pageLink.sortOrder) {
            params.sortProperty = query.pageLink.sortOrder.property;
            params.sortOrder = query.pageLink.sortOrder.direction;
        }
        if (query.pageLink.startTime) params.startTime = query.pageLink.startTime;
        if (query.pageLink.endTime) params.endTime = query.pageLink.endTime;

        if (query.typeList) {
            params.typeList = query.typeList.join(',');
        }
        if (query.statusList) {
            params.statusList = query.statusList.join(',');
        }
        if (query.severityList) {
            params.severityList = query.severityList.join(',');
        }
        if (query.assigneeId) {
            params.assigneeId = query.assigneeId.id;
        }
        return params;
    }
}

