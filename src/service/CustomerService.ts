import { ThingsboardClient } from '../ThingsboardClient';
import { Customer, ShortCustomerInfo } from '../model/customer';
import { PageData, PageLink } from '../model/page';

export class CustomerService {
    private tbClient: ThingsboardClient;

    constructor(tbClient: ThingsboardClient) {
        this.tbClient = tbClient;
    }

    public async getCustomers(pageLink: PageLink): Promise<PageData<Customer>> {
        let url = `/api/customers?pageSize=${pageLink.pageSize}&page=${pageLink.page}`;
        if (pageLink.textSearch) {
            url += `&textSearch=${pageLink.textSearch}`;
        }
        if (pageLink.sortOrder) {
            url += `&sortProperty=${pageLink.sortOrder.property}&sortOrder=${pageLink.sortOrder.direction}`;
        }
        return this.tbClient.get<PageData<Customer>>(url);
    }

    public async getCustomer(customerId: string): Promise<Customer | null> {
        return this.tbClient.get<Customer>(`/api/customer/${customerId}`);
    }

    public async saveCustomer(customer: Customer): Promise<Customer> {
        return this.tbClient.post<Customer>('/api/customer', customer);
    }

    public async deleteCustomer(customerId: string): Promise<void> {
        return this.tbClient.delete(`/api/customer/${customerId}`);
    }

    public async getShortCustomerInfo(customerId: string): Promise<ShortCustomerInfo | null> {
        return this.tbClient.get<ShortCustomerInfo>(`/api/customer/${customerId}/shortInfo`);
    }

    public async getCustomerTitle(customerId: string): Promise<string | null> {
        return this.tbClient.get<string>(`/api/customer/${customerId}/title`);
    }

    public async getTenantCustomer(customerTitle: string): Promise<Customer | null> {
        return this.tbClient.get<Customer>(`/api/tenant/customers?customerTitle=${customerTitle}`);
    }
}
