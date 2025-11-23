import { ThingsboardClient } from '../ThingsboardClient';
import { DashboardInfo } from '../model/dashboard';
import { PageData, PageLink } from '../model/page';

export class DashboardService {
    private tbClient: ThingsboardClient;

    constructor(tbClient: ThingsboardClient) {
        this.tbClient = tbClient;
    }

    public async getTenantDashboards(pageLink: PageLink): Promise<PageData<DashboardInfo>> {
        let url = `/api/tenant/dashboards?pageSize=${pageLink.pageSize}&page=${pageLink.page}`;
        if (pageLink.textSearch) {
            url += `&textSearch=${pageLink.textSearch}`;
        }
        if (pageLink.sortOrder) {
            url += `&sortProperty=${pageLink.sortOrder.property}&sortOrder=${pageLink.sortOrder.direction}`;
        }
        return this.tbClient.get<PageData<DashboardInfo>>(url);
    }

    public async getCustomerDashboards(customerId: string, pageLink: PageLink): Promise<PageData<DashboardInfo>> {
        let url = `/api/customer/${customerId}/dashboards?pageSize=${pageLink.pageSize}&page=${pageLink.page}`;
        if (pageLink.textSearch) {
            url += `&textSearch=${pageLink.textSearch}`;
        }
        if (pageLink.sortOrder) {
            url += `&sortProperty=${pageLink.sortOrder.property}&sortOrder=${pageLink.sortOrder.direction}`;
        }
        return this.tbClient.get<PageData<DashboardInfo>>(url);
    }

    public async getServerTime(): Promise<number> {
        return this.tbClient.get<number>('/api/dashboard/serverTime');
    }

    public async getMaxDatapointsLimit(): Promise<number> {
        return this.tbClient.get<number>('/api/dashboard/maxDatapointsLimit');
    }
}
