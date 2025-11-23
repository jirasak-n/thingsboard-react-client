import { ThingsboardClient } from '../ThingsboardClient';
import { User } from '../model/user';
import { PageData, PageLink } from '../model/page';

export class UserService {
    private tbClient: ThingsboardClient;

    constructor(tbClient: ThingsboardClient) {
        this.tbClient = tbClient;
    }

    public async getUsers(pageLink: PageLink): Promise<PageData<User>> {
        let url = `/api/users?pageSize=${pageLink.pageSize}&page=${pageLink.page}`;
        if (pageLink.textSearch) {
            url += `&textSearch=${pageLink.textSearch}`;
        }
        if (pageLink.sortOrder) {
            url += `&sortProperty=${pageLink.sortOrder.property}&sortOrder=${pageLink.sortOrder.direction}`;
        }
        return this.tbClient.get<PageData<User>>(url);
    }

    public async getUser(userId: string): Promise<User | null> {
        return this.tbClient.get<User>(`/api/user/${userId}`);
    }

    public async saveUser(user: User, sendActivationMail: boolean = false): Promise<User> {
        return this.tbClient.post<User>(`/api/user?sendActivationMail=${sendActivationMail}`, user);
    }

    public async deleteUser(userId: string): Promise<void> {
        return this.tbClient.delete(`/api/user/${userId}`);
    }

    public async getTenantAdmins(tenantId: string, pageLink: PageLink): Promise<PageData<User>> {
        let url = `/api/tenant/${tenantId}/users?pageSize=${pageLink.pageSize}&page=${pageLink.page}`;
        if (pageLink.textSearch) {
            url += `&textSearch=${pageLink.textSearch}`;
        }
        if (pageLink.sortOrder) {
            url += `&sortProperty=${pageLink.sortOrder.property}&sortOrder=${pageLink.sortOrder.direction}`;
        }
        return this.tbClient.get<PageData<User>>(url);
    }

    public async getCustomerUsers(customerId: string, pageLink: PageLink): Promise<PageData<User>> {
        let url = `/api/customer/${customerId}/users?pageSize=${pageLink.pageSize}&page=${pageLink.page}`;
        if (pageLink.textSearch) {
            url += `&textSearch=${pageLink.textSearch}`;
        }
        if (pageLink.sortOrder) {
            url += `&sortProperty=${pageLink.sortOrder.property}&sortOrder=${pageLink.sortOrder.direction}`;
        }
        return this.tbClient.get<PageData<User>>(url);
    }

    public async getUserToken(userId: string): Promise<string> {
        return this.tbClient.get<string>(`/api/user/${userId}/token`);
    }

    public async sendActivationEmail(email: string): Promise<void> {
        return this.tbClient.post(`/api/user/sendActivationMail?email=${email}`);
    }

    public async getActivationLink(userId: string): Promise<string> {
        return this.tbClient.get<string>(`/api/user/${userId}/activationLink`);
    }

    public async setUserCredentialsEnabled(userId: string, userCredentialsEnabled?: boolean): Promise<void> {
        const enabled = userCredentialsEnabled === undefined ? true : userCredentialsEnabled;
        return this.tbClient.post(`/api/user/${userId}/userCredentialsEnabled?userCredentialsEnabled=${enabled}`);
    }
}
