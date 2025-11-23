import { ThingsboardClient } from '../ThingsboardClient';
import { Dashboard, DashboardInfo } from '../model/dashboard';
import { PageData, PageLink } from '../model/page';

export class DashboardService {
    private tbClient: ThingsboardClient;

    constructor(tbClient: ThingsboardClient) {
        this.tbClient = tbClient;
    }

    public async getTenantDashboards(pageLink: PageLink, mobile?: boolean): Promise<PageData<DashboardInfo>> {
        let url = `/api/tenant/dashboards?pageSize=${pageLink.pageSize}&page=${pageLink.page}`;
        if (mobile !== undefined) {
            url += `&mobile=${mobile}`;
        }
        if (pageLink.textSearch) {
            url += `&textSearch=${pageLink.textSearch}`;
        }
        if (pageLink.sortOrder) {
            url += `&sortProperty=${pageLink.sortOrder.property}&sortOrder=${pageLink.sortOrder.direction}`;
        }
        return this.tbClient.get<PageData<DashboardInfo>>(url);
    }

    public async getCustomerDashboards(customerId: string, pageLink: PageLink, mobile?: boolean): Promise<PageData<DashboardInfo>> {
        let url = `/api/customer/${customerId}/dashboards?pageSize=${pageLink.pageSize}&page=${pageLink.page}`;
        if (mobile !== undefined) {
            url += `&mobile=${mobile}`;
        }
        if (pageLink.textSearch) {
            url += `&textSearch=${pageLink.textSearch}`;
        }
        if (pageLink.sortOrder) {
            url += `&sortProperty=${pageLink.sortOrder.property}&sortOrder=${pageLink.sortOrder.direction}`;
        }
        return this.tbClient.get<PageData<DashboardInfo>>(url);
    }

    public async getDashboard(dashboardId: string): Promise<Dashboard | null> {
        return this.tbClient.get<Dashboard>(`/api/dashboard/${dashboardId}`);
    }

    public async getDashboardInfo(dashboardId: string): Promise<DashboardInfo | null> {
        return this.tbClient.get<DashboardInfo>(`/api/dashboard/info/${dashboardId}`);
    }

    public async saveDashboard(dashboard: Dashboard): Promise<Dashboard> {
        return this.tbClient.post<Dashboard>('/api/dashboard', dashboard);
    }

    public async deleteDashboard(dashboardId: string): Promise<void> {
        return this.tbClient.delete(`/api/dashboard/${dashboardId}`);
    }

    public async assignDashboardToCustomer(customerId: string, dashboardId: string): Promise<Dashboard | null> {
        return this.tbClient.post<Dashboard>(`/api/customer/${customerId}/dashboard/${dashboardId}`);
    }

    public async unassignDashboardFromCustomer(customerId: string, dashboardId: string): Promise<Dashboard | null> {
        return this.tbClient.delete<Dashboard>(`/api/customer/${customerId}/dashboard/${dashboardId}`);
    }

    public async makeDashboardPublic(dashboardId: string): Promise<Dashboard | null> {
        return this.tbClient.post<Dashboard>(`/api/customer/public/dashboard/${dashboardId}`);
    }

    public async makeDashboardPrivate(dashboardId: string): Promise<Dashboard | null> {
        return this.tbClient.delete<Dashboard>(`/api/customer/public/dashboard/${dashboardId}`);
    }

    public async updateDashboardCustomers(dashboardId: string, customerIds: string[]): Promise<Dashboard | null> {
        return this.tbClient.post<Dashboard>(`/api/dashboard/${dashboardId}/customers`, customerIds);
    }

    public async addDashboardCustomers(dashboardId: string, customerIds: string[]): Promise<Dashboard | null> {
        return this.tbClient.post<Dashboard>(`/api/dashboard/${dashboardId}/customers/add`, customerIds);
    }

    public async removeDashboardCustomers(dashboardId: string, customerIds: string[]): Promise<Dashboard | null> {
        return this.tbClient.post<Dashboard>(`/api/dashboard/${dashboardId}/customers/remove`, customerIds);
    }

    public async getHomeDashboard(): Promise<Dashboard | null> {
        return this.tbClient.get<Dashboard>('/api/dashboard/home');
    }

    public async getHomeDashboardInfo(): Promise<DashboardInfo | null> {
        return this.tbClient.get<DashboardInfo>('/api/dashboard/home/info');
    }

    public async getTenantHomeDashboardInfo(): Promise<DashboardInfo | null> {
        return this.tbClient.get<DashboardInfo>('/api/tenant/dashboard/home/info');
    }

    public async setTenantHomeDashboardInfo(homeDashboardInfo: DashboardInfo): Promise<void> {
        return this.tbClient.post('/api/tenant/dashboard/home/info', homeDashboardInfo);
    }
    public async getServerTime(): Promise<number> {
        return this.tbClient.get<number>('/api/dashboard/serverTime');
    }

    public async getMaxDatapointsLimit(): Promise<number> {
        return this.tbClient.get<number>('/api/dashboard/maxDatapointsLimit');
    }
}
