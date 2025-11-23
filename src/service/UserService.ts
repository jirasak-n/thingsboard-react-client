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
}
